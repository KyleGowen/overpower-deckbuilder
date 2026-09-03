#!/usr/bin/env python3
"""Collect a bounded, read-only Excelsior AWS cost-audit snapshot.

The script intentionally produces evidence, not recommendations. It verifies the
AWS account, limits inventory to strongly owned Excelsior resources, summarizes
AWS billing and CloudWatch data, and records coverage failures without turning a
failed API call into evidence that a resource does not exist.
"""

from __future__ import annotations

import argparse
import calendar
import datetime as dt
import json
import math
import os
import shutil
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence


EXPECTED_ACCOUNT = "474120878015"
PRIMARY_REGION = "us-west-2"
BILLING_REGION = "us-east-1"
ACTIVE_ECR_REPOSITORY = "overpower-deckbuilder"
LEGACY_ECR_REPOSITORY = "op-deckbuilder-repo"
RDS_IDENTIFIER = "op-deckbuilder-postgres"
EC2_NAME = "op-deckbuilder-app"
ROUTE53_ZONE = "excelsior.cards."
PROJECT_TOKENS = (
    "op-deckbuilder",
    "overpower-deckbuilder",
    "overpower deckbuilder",
    "excelsior",
)
KNOWN_EXCELSIOR_EIP_CANDIDATES = ("44.230.134.205",)

RELEVANT_SERVICE_FRAGMENTS = (
    "elastic compute cloud",
    "ec2 - other",
    "elastic container registry",
    "container registry",
    "relational database",
    "simple storage service",
    "cloudfront",
    "route 53",
    "virtual private cloud",
    "lambda",
    "simple email service",
    "cloudwatch",
    "systems manager",
    "key management service",
)

TRANSIENT_ERROR_MARKERS = (
    "throttl",
    "requestlimitexceeded",
    "serviceunavailable",
    "internalerror",
    "connection reset",
    "timed out",
)


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def iso(value: Any) -> Any:
    if isinstance(value, (dt.datetime, dt.date)):
        return value.isoformat().replace("+00:00", "Z")
    return value


def tags_to_dict(tags: Iterable[dict[str, Any]] | None) -> dict[str, str]:
    result: dict[str, str] = {}
    for tag in tags or []:
        key = tag.get("Key")
        if key:
            result[str(key)] = str(tag.get("Value", ""))
    return result


def has_project_ownership(tags: Iterable[dict[str, Any]] | None, *names: str | None) -> bool:
    tag_values = " ".join(f"{key} {value}" for key, value in tags_to_dict(tags).items()).lower()
    name_values = " ".join(value or "" for value in names).lower()
    haystack = f"{tag_values} {name_values}"
    return any(token in haystack for token in PROJECT_TOKENS)


def is_relevant_service(service_name: str) -> bool:
    lowered = service_name.lower()
    return any(fragment in lowered for fragment in RELEVANT_SERVICE_FRAGMENTS)


def previous_and_current_month_window(today: dt.date) -> tuple[str, str]:
    current_start = today.replace(day=1)
    previous_end = current_start
    previous_start = (previous_end - dt.timedelta(days=1)).replace(day=1)
    # Cost Explorer's end is exclusive. Include today so the partial period can
    # contain charges AWS has posted through the previous day.
    end = today + dt.timedelta(days=1)
    return previous_start.isoformat(), end.isoformat()


def summarize_numbers(values: Sequence[float]) -> dict[str, float | int | None]:
    finite = [float(value) for value in values if math.isfinite(float(value))]
    if not finite:
        return {"samples": 0, "minimum": None, "maximum": None, "mean": None, "latest": None}
    return {
        "samples": len(finite),
        "minimum": min(finite),
        "maximum": max(finite),
        "mean": sum(finite) / len(finite),
        "latest": finite[-1],
    }


def redact_error(stderr: str) -> str:
    line = " ".join(stderr.strip().split())
    if not line:
        return "AWS CLI returned no diagnostic text"
    return line[:500]


def compact_tags(tags: Iterable[dict[str, Any]] | None) -> dict[str, str]:
    allowed = {"Name", "Project", "Environment", "ManagedBy", "Application"}
    return {key: value for key, value in tags_to_dict(tags).items() if key in allowed}


@dataclass
class CallRecord:
    name: str
    status: str
    detail: str | None = None


class AwsCollector:
    def __init__(self, region: str, expected_account: str, repo_root: Path) -> None:
        self.region = region
        self.expected_account = expected_account
        self.repo_root = repo_root
        self.calls: list[CallRecord] = []

    def aws(
        self,
        name: str,
        service: str,
        operation: str,
        args: Sequence[str] = (),
        *,
        region: str | None = None,
        optional: bool = False,
        absent_error_markers: Sequence[str] = (),
    ) -> dict[str, Any] | None:
        command = [
            "aws",
            "--no-cli-pager",
            "--region",
            region or self.region,
            service,
            operation,
            *args,
            "--output",
            "json",
        ]
        env = os.environ.copy()
        env["AWS_PAGER"] = ""
        env["AWS_EC2_METADATA_DISABLED"] = "true"

        for attempt in range(2):
            try:
                completed = subprocess.run(
                    command,
                    check=False,
                    capture_output=True,
                    text=True,
                    timeout=75,
                    env=env,
                )
            except subprocess.TimeoutExpired:
                detail = "AWS CLI timed out after 75 seconds"
                if attempt == 0:
                    continue
                self.calls.append(CallRecord(name, "failed", detail))
                return None

            if completed.returncode == 0:
                try:
                    payload = json.loads(completed.stdout or "{}")
                except json.JSONDecodeError as exc:
                    self.calls.append(CallRecord(name, "failed", f"invalid JSON: {exc}"))
                    return None
                self.calls.append(CallRecord(name, "ok"))
                return payload

            detail = redact_error(completed.stderr)
            matched_absence = next(
                (marker for marker in absent_error_markers if marker.lower() in detail.lower()),
                None,
            )
            if matched_absence:
                self.calls.append(CallRecord(name, "ok", f"absent: {matched_absence}"))
                return {}
            transient = any(marker in detail.lower() for marker in TRANSIENT_ERROR_MARKERS)
            if attempt == 0 and transient:
                continue
            status = "unavailable" if optional else "failed"
            self.calls.append(CallRecord(name, status, detail))
            return None
        return None

    def collect_identity(self) -> dict[str, Any]:
        payload = self.aws("caller_identity", "sts", "get-caller-identity")
        if not payload:
            raise RuntimeError("Unable to verify AWS caller identity")
        account = str(payload.get("Account", ""))
        if account != self.expected_account:
            raise RuntimeError(
                f"AWS account mismatch: expected {self.expected_account}, received {account or 'unknown'}"
            )
        return {
            "account": account,
            "arn": payload.get("Arn"),
            "primary_region": self.region,
            "billing_region": BILLING_REGION,
            "verified": True,
        }

    def collect_costs(self, today: dt.date) -> dict[str, Any]:
        start, end = previous_and_current_month_window(today)
        payload = self.aws(
            "cost_explorer_service_usage",
            "ce",
            "get-cost-and-usage",
            (
                "--time-period",
                json.dumps({"Start": start, "End": end}),
                "--granularity",
                "MONTHLY",
                "--metrics",
                json.dumps(["UnblendedCost", "UsageQuantity"]),
                "--group-by",
                json.dumps(
                    [
                        {"Type": "DIMENSION", "Key": "SERVICE"},
                        {"Type": "DIMENSION", "Key": "USAGE_TYPE"},
                    ]
                ),
            ),
            region=BILLING_REGION,
        )
        if not payload:
            return {"window": {"start": start, "end_exclusive": end}, "periods": []}

        periods: list[dict[str, Any]] = []
        for period in payload.get("ResultsByTime", []):
            service_totals: defaultdict[str, float] = defaultdict(float)
            usage_rows: list[dict[str, Any]] = []
            for group in period.get("Groups", []):
                keys = group.get("Keys", [])
                if len(keys) < 2 or not is_relevant_service(str(keys[0])):
                    continue
                cost_metric = group.get("Metrics", {}).get("UnblendedCost", {})
                usage_metric = group.get("Metrics", {}).get("UsageQuantity", {})
                amount = float(cost_metric.get("Amount", 0) or 0)
                service = str(keys[0])
                service_totals[service] += amount
                if abs(amount) >= 0.000001:
                    usage_rows.append(
                        {
                            "service": service,
                            "usage_type": str(keys[1]),
                            "cost_amount": amount,
                            "cost_unit": cost_metric.get("Unit", "USD"),
                            "usage_quantity": float(usage_metric.get("Amount", 0) or 0),
                            "usage_unit": usage_metric.get("Unit"),
                        }
                    )
            usage_rows.sort(key=lambda row: abs(row["cost_amount"]), reverse=True)
            periods.append(
                {
                    "start": period.get("TimePeriod", {}).get("Start"),
                    "end_exclusive": period.get("TimePeriod", {}).get("End"),
                    "estimated": bool(period.get("Estimated")),
                    "relevant_service_total": sum(service_totals.values()),
                    "service_totals": [
                        {"service": service, "amount": amount, "unit": "USD"}
                        for service, amount in sorted(service_totals.items(), key=lambda item: -abs(item[1]))
                    ],
                    "usage_type_costs": usage_rows,
                    "scope_warning": (
                        "Cost Explorer service and usage-type totals are account-level upper bounds. "
                        "Attribute them to Excelsior only after owned-resource reconciliation."
                    ),
                }
            )
        return {"window": {"start": start, "end_exclusive": end}, "periods": periods}

    def collect_ec2(self) -> dict[str, Any]:
        payload = self.aws(
            "ec2_instances",
            "ec2",
            "describe-instances",
            ("--filters", json.dumps([{"Name": "tag:Name", "Values": [EC2_NAME]}])),
        )
        instances: list[dict[str, Any]] = []
        for reservation in (payload or {}).get("Reservations", []):
            for instance in reservation.get("Instances", []):
                instances.append(
                    {
                        "instance_id": instance.get("InstanceId"),
                        "state": instance.get("State", {}).get("Name"),
                        "instance_type": instance.get("InstanceType"),
                        "launch_time": iso(instance.get("LaunchTime")),
                        "availability_zone": instance.get("Placement", {}).get("AvailabilityZone"),
                        "vpc_id": instance.get("VpcId"),
                        "subnet_id": instance.get("SubnetId"),
                        "public_ip": instance.get("PublicIpAddress"),
                        "private_ip": instance.get("PrivateIpAddress"),
                        "monitoring": instance.get("Monitoring", {}).get("State"),
                        "architecture": instance.get("Architecture"),
                        "security_group_ids": [group.get("GroupId") for group in instance.get("SecurityGroups", [])],
                        "tags": compact_tags(instance.get("Tags")),
                    }
                )
        known_instance_ids = {item["instance_id"] for item in instances if item.get("instance_id")}
        known_vpc_ids = {item["vpc_id"] for item in instances if item.get("vpc_id")}
        known_sg_ids = {
            sg_id
            for item in instances
            for sg_id in item.get("security_group_ids", [])
            if sg_id
        }

        addresses_payload = self.aws("ec2_elastic_addresses", "ec2", "describe-addresses")
        addresses: list[dict[str, Any]] = []
        for address in (addresses_payload or {}).get("Addresses", []):
            if (
                address.get("InstanceId") in known_instance_ids
                or address.get("PublicIp") in KNOWN_EXCELSIOR_EIP_CANDIDATES
                or has_project_ownership(
                    address.get("Tags"), address.get("PublicIp"), address.get("PrivateIpAddress")
                )
            ):
                addresses.append(
                    {
                        "allocation_id": address.get("AllocationId"),
                        "association_id": address.get("AssociationId"),
                        "public_ip": address.get("PublicIp"),
                        "private_ip": address.get("PrivateIpAddress"),
                        "instance_id": address.get("InstanceId"),
                        "network_interface_id": address.get("NetworkInterfaceId"),
                        "associated": bool(address.get("AssociationId")),
                        "tags": compact_tags(address.get("Tags")),
                    }
                )

        volumes_payload = self.aws("ec2_volumes", "ec2", "describe-volumes")
        volumes: list[dict[str, Any]] = []
        known_volume_ids: set[str] = set()
        for volume in (volumes_payload or {}).get("Volumes", []):
            attachments = volume.get("Attachments", [])
            attached_to_known = any(item.get("InstanceId") in known_instance_ids for item in attachments)
            if attached_to_known or has_project_ownership(volume.get("Tags"), volume.get("VolumeId")):
                volume_id = volume.get("VolumeId")
                if volume_id:
                    known_volume_ids.add(volume_id)
                volumes.append(
                    {
                        "volume_id": volume_id,
                        "state": volume.get("State"),
                        "size_gib": volume.get("Size"),
                        "volume_type": volume.get("VolumeType"),
                        "iops": volume.get("Iops"),
                        "throughput": volume.get("Throughput"),
                        "encrypted": volume.get("Encrypted"),
                        "create_time": iso(volume.get("CreateTime")),
                        "snapshot_id": volume.get("SnapshotId"),
                        "attachments": [
                            {
                                "instance_id": item.get("InstanceId"),
                                "device": item.get("Device"),
                                "state": item.get("State"),
                                "delete_on_termination": item.get("DeleteOnTermination"),
                            }
                            for item in attachments
                        ],
                        "tags": compact_tags(volume.get("Tags")),
                    }
                )

        snapshots_payload = self.aws(
            "ec2_snapshots",
            "ec2",
            "describe-snapshots",
            ("--owner-ids", "self"),
        )
        snapshots: list[dict[str, Any]] = []
        for snapshot in (snapshots_payload or {}).get("Snapshots", []):
            if snapshot.get("VolumeId") in known_volume_ids or has_project_ownership(
                snapshot.get("Tags"), snapshot.get("Description"), snapshot.get("SnapshotId")
            ):
                snapshots.append(
                    {
                        "snapshot_id": snapshot.get("SnapshotId"),
                        "volume_id": snapshot.get("VolumeId"),
                        "volume_size_gib": snapshot.get("VolumeSize"),
                        "state": snapshot.get("State"),
                        "start_time": iso(snapshot.get("StartTime")),
                        "encrypted": snapshot.get("Encrypted"),
                        "tags": compact_tags(snapshot.get("Tags")),
                    }
                )

        nat_payload = self.aws("ec2_nat_gateways", "ec2", "describe-nat-gateways")
        nat_gateways: list[dict[str, Any]] = []
        for gateway in (nat_payload or {}).get("NatGateways", []):
            if has_project_ownership(gateway.get("Tags"), gateway.get("NatGatewayId")):
                nat_gateways.append(
                    {
                        "nat_gateway_id": gateway.get("NatGatewayId"),
                        "state": gateway.get("State"),
                        "vpc_id": gateway.get("VpcId"),
                        "subnet_id": gateway.get("SubnetId"),
                        "create_time": iso(gateway.get("CreateTime")),
                        "public_ips": [item.get("PublicIp") for item in gateway.get("NatGatewayAddresses", [])],
                        "tags": compact_tags(gateway.get("Tags")),
                    }
                )

        return {
            "instances": instances,
            "elastic_addresses": addresses,
            "volumes": volumes,
            "snapshots": snapshots,
            "nat_gateways": nat_gateways,
            "known_instance_ids": sorted(known_instance_ids),
            "known_vpc_ids": sorted(known_vpc_ids),
            "known_security_group_ids": sorted(known_sg_ids),
        }

    def collect_rds(self) -> dict[str, Any]:
        payload = self.aws(
            "rds_instance",
            "rds",
            "describe-db-instances",
            ("--db-instance-identifier", RDS_IDENTIFIER),
        )
        instances: list[dict[str, Any]] = []
        for instance in (payload or {}).get("DBInstances", []):
            instances.append(
                {
                    "identifier": instance.get("DBInstanceIdentifier"),
                    "arn": instance.get("DBInstanceArn"),
                    "status": instance.get("DBInstanceStatus"),
                    "engine": instance.get("Engine"),
                    "engine_version": instance.get("EngineVersion"),
                    "instance_class": instance.get("DBInstanceClass"),
                    "allocated_storage_gib": instance.get("AllocatedStorage"),
                    "max_allocated_storage_gib": instance.get("MaxAllocatedStorage"),
                    "storage_type": instance.get("StorageType"),
                    "storage_encrypted": instance.get("StorageEncrypted"),
                    "multi_az": instance.get("MultiAZ"),
                    "publicly_accessible": instance.get("PubliclyAccessible"),
                    "availability_zone": instance.get("AvailabilityZone"),
                    "endpoint_address": instance.get("Endpoint", {}).get("Address"),
                    "endpoint_port": instance.get("Endpoint", {}).get("Port"),
                    "backup_retention_days": instance.get("BackupRetentionPeriod"),
                    "deletion_protection": instance.get("DeletionProtection"),
                    "auto_minor_version_upgrade": instance.get("AutoMinorVersionUpgrade"),
                    "performance_insights": instance.get("PerformanceInsightsEnabled"),
                    "monitoring_interval_seconds": instance.get("MonitoringInterval"),
                    "vpc_security_group_ids": [
                        item.get("VpcSecurityGroupId") for item in instance.get("VpcSecurityGroups", [])
                    ],
                    "tags": compact_tags(instance.get("TagList")),
                }
            )

        snapshot_payload = self.aws(
            "rds_snapshots",
            "rds",
            "describe-db-snapshots",
            ("--db-instance-identifier", RDS_IDENTIFIER),
        )
        snapshots = [
            {
                "snapshot_id": item.get("DBSnapshotIdentifier"),
                "snapshot_type": item.get("SnapshotType"),
                "status": item.get("Status"),
                "create_time": iso(item.get("SnapshotCreateTime")),
                "allocated_storage_gib": item.get("AllocatedStorage"),
                "encrypted": item.get("Encrypted"),
            }
            for item in (snapshot_payload or {}).get("DBSnapshots", [])
        ]

        reserved_payload = self.aws(
            "rds_reserved_instances",
            "rds",
            "describe-reserved-db-instances",
            optional=True,
        )
        current_classes = {item.get("instance_class") for item in instances}
        reservations = [
            {
                "reservation_id": item.get("ReservedDBInstanceId"),
                "instance_class": item.get("DBInstanceClass"),
                "duration_seconds": item.get("Duration"),
                "instance_count": item.get("DBInstanceCount"),
                "state": item.get("State"),
                "offering_type": item.get("OfferingType"),
                "fixed_price": item.get("FixedPrice"),
                "usage_price": item.get("UsagePrice"),
            }
            for item in (reserved_payload or {}).get("ReservedDBInstances", [])
            if item.get("DBInstanceClass") in current_classes
        ]
        return {"instances": instances, "snapshots": snapshots, "matching_reservations": reservations}

    def collect_network_interfaces(self, ec2: dict[str, Any], rds: dict[str, Any]) -> list[dict[str, Any]]:
        payload = self.aws("ec2_network_interfaces", "ec2", "describe-network-interfaces")
        known_instances = set(ec2.get("known_instance_ids", []))
        known_sgs = set(ec2.get("known_security_group_ids", []))
        for instance in rds.get("instances", []):
            known_sgs.update(instance.get("vpc_security_group_ids", []))

        interfaces: list[dict[str, Any]] = []
        for interface in (payload or {}).get("NetworkInterfaces", []):
            attachment_instance = interface.get("Attachment", {}).get("InstanceId")
            group_ids = {item.get("GroupId") for item in interface.get("Groups", [])}
            description = str(interface.get("Description", ""))
            owned = (
                attachment_instance in known_instances
                or bool(group_ids & known_sgs)
                or has_project_ownership(interface.get("TagSet"), description, interface.get("InterfaceType"))
                or RDS_IDENTIFIER in description
            )
            if owned:
                interfaces.append(
                    {
                        "network_interface_id": interface.get("NetworkInterfaceId"),
                        "description": description,
                        "status": interface.get("Status"),
                        "interface_type": interface.get("InterfaceType"),
                        "private_ip": interface.get("PrivateIpAddress"),
                        "public_ip": interface.get("Association", {}).get("PublicIp"),
                        "association_allocation_id": interface.get("Association", {}).get("AllocationId"),
                        "attachment_instance_id": attachment_instance,
                        "security_group_ids": sorted(group_id for group_id in group_ids if group_id),
                        "subnet_id": interface.get("SubnetId"),
                        "vpc_id": interface.get("VpcId"),
                        "tags": compact_tags(interface.get("TagSet")),
                    }
                )
        return interfaces

    def collect_ecr(self) -> list[dict[str, Any]]:
        repositories: list[dict[str, Any]] = []
        for repository_name in (ACTIVE_ECR_REPOSITORY, LEGACY_ECR_REPOSITORY):
            description = self.aws(
                f"ecr_repository_{repository_name}",
                "ecr",
                "describe-repositories",
                ("--repository-names", repository_name),
                optional=True,
                absent_error_markers=("RepositoryNotFoundException",),
            )
            if not description or not description.get("repositories"):
                repositories.append({"repository_name": repository_name, "present": False})
                continue

            repository = description["repositories"][0]
            images_payload = self.aws(
                f"ecr_images_{repository_name}",
                "ecr",
                "describe-images",
                ("--repository-name", repository_name),
            )
            image_details = (images_payload or {}).get("imageDetails", [])
            image_details.sort(key=lambda item: str(item.get("imagePushedAt", "")))
            tagged = [item for item in image_details if item.get("imageTags")]
            untagged = [item for item in image_details if not item.get("imageTags")]
            latest = next((item for item in image_details if "latest" in item.get("imageTags", [])), None)

            policy_payload = self.aws(
                f"ecr_lifecycle_{repository_name}",
                "ecr",
                "get-lifecycle-policy",
                ("--repository-name", repository_name),
                optional=True,
                absent_error_markers=("LifecyclePolicyNotFoundException",),
            )
            policy: Any = None
            if policy_payload and policy_payload.get("lifecyclePolicyText"):
                try:
                    policy = json.loads(policy_payload["lifecyclePolicyText"])
                except json.JSONDecodeError:
                    policy = {"parse_error": True}

            sizes = [int(item.get("imageSizeInBytes", 0) or 0) for item in image_details]
            repositories.append(
                {
                    "repository_name": repository_name,
                    "present": True,
                    "repository_arn": repository.get("repositoryArn"),
                    "created_at": iso(repository.get("createdAt")),
                    "tag_mutability": repository.get("imageTagMutability"),
                    "scan_on_push": repository.get("imageScanningConfiguration", {}).get("scanOnPush"),
                    "encryption_type": repository.get("encryptionConfiguration", {}).get("encryptionType"),
                    "image_count": len(image_details),
                    "tagged_count": len(tagged),
                    "untagged_count": len(untagged),
                    "oldest_image_pushed_at": iso(image_details[0].get("imagePushedAt")) if image_details else None,
                    "newest_image_pushed_at": iso(image_details[-1].get("imagePushedAt")) if image_details else None,
                    "latest_tag_digest": latest.get("imageDigest") if latest else None,
                    "non_deduplicated_image_size_bytes": sum(sizes),
                    "size_warning": (
                        "Sum of per-manifest compressed image sizes; shared layers may be counted repeatedly. "
                        "Do not equate this with billed ECR storage."
                    ),
                    "recent_images": [
                        {
                            "digest": item.get("imageDigest"),
                            "tags": item.get("imageTags", [])[:5],
                            "pushed_at": iso(item.get("imagePushedAt")),
                            "size_bytes": item.get("imageSizeInBytes"),
                            "artifact_media_type": item.get("artifactMediaType"),
                        }
                        for item in image_details[-10:]
                    ],
                    "lifecycle_policy": policy,
                }
            )
        return repositories

    def collect_s3(self) -> list[dict[str, Any]]:
        payload = self.aws("s3_buckets", "s3api", "list-buckets")
        owned_names = [
            bucket.get("Name")
            for bucket in (payload or {}).get("Buckets", [])
            if bucket.get("Name")
            and (
                str(bucket["Name"]).startswith("op-deckbuilder-")
                or "excelsior" in str(bucket["Name"]).lower()
            )
        ]
        buckets: list[dict[str, Any]] = []
        for name in owned_names:
            tagging = self.aws(
                f"s3_tags_{name}",
                "s3api",
                "get-bucket-tagging",
                ("--bucket", str(name)),
                optional=True,
                absent_error_markers=("NoSuchTagSet",),
            )
            lifecycle = self.aws(
                f"s3_lifecycle_{name}",
                "s3api",
                "get-bucket-lifecycle-configuration",
                ("--bucket", str(name)),
                optional=True,
                absent_error_markers=("NoSuchLifecycleConfiguration",),
            )
            versioning = self.aws(
                f"s3_versioning_{name}",
                "s3api",
                "get-bucket-versioning",
                ("--bucket", str(name)),
                optional=True,
            )
            buckets.append(
                {
                    "bucket_name": name,
                    "tags": compact_tags((tagging or {}).get("TagSet")),
                    "versioning_status": (versioning or {}).get("Status"),
                    "mfa_delete": (versioning or {}).get("MFADelete"),
                    "lifecycle_rules": (lifecycle or {}).get("Rules", []),
                }
            )
        return buckets

    def collect_cloudfront(self) -> list[dict[str, Any]]:
        payload = self.aws(
            "cloudfront_distributions",
            "cloudfront",
            "list-distributions",
            region=BILLING_REGION,
        )
        distributions: list[dict[str, Any]] = []
        for item in (payload or {}).get("DistributionList", {}).get("Items", []):
            aliases = item.get("Aliases", {}).get("Items", [])
            comment = str(item.get("Comment", ""))
            origins = item.get("Origins", {}).get("Items", [])
            owned = (
                "excelsior.cards" in aliases
                or "excelsior" in comment.lower()
                or any("excelsior.cards" in str(origin.get("DomainName", "")) for origin in origins)
                or any("op-deckbuilder" in str(origin.get("DomainName", "")) for origin in origins)
            )
            if owned:
                distributions.append(
                    {
                        "distribution_id": item.get("Id"),
                        "arn": item.get("ARN"),
                        "status": item.get("Status"),
                        "enabled": item.get("Enabled"),
                        "domain_name": item.get("DomainName"),
                        "aliases": aliases,
                        "comment": comment,
                        "price_class": item.get("PriceClass"),
                        "last_modified_time": iso(item.get("LastModifiedTime")),
                        "origins": [
                            {"id": origin.get("Id"), "domain_name": origin.get("DomainName")}
                            for origin in origins
                        ],
                        "ordered_path_patterns": [
                            behavior.get("PathPattern")
                            for behavior in item.get("CacheBehaviors", {}).get("Items", [])
                        ],
                    }
                )
        return distributions

    def collect_route53(self) -> dict[str, Any]:
        payload = self.aws(
            "route53_zones",
            "route53",
            "list-hosted-zones-by-name",
            ("--dns-name", "excelsior.cards", "--max-items", "5"),
            region=BILLING_REGION,
        )
        zone = next(
            (item for item in (payload or {}).get("HostedZones", []) if item.get("Name") == ROUTE53_ZONE),
            None,
        )
        if not zone:
            return {"zone": None, "records": []}
        zone_id = str(zone.get("Id", "")).split("/")[-1]
        records_payload = self.aws(
            "route53_records",
            "route53",
            "list-resource-record-sets",
            ("--hosted-zone-id", zone_id),
            region=BILLING_REGION,
        )
        records = []
        for record in (records_payload or {}).get("ResourceRecordSets", []):
            records.append(
                {
                    "name": record.get("Name"),
                    "type": record.get("Type"),
                    "ttl": record.get("TTL"),
                    "values": [item.get("Value") for item in record.get("ResourceRecords", [])],
                    "alias_dns_name": record.get("AliasTarget", {}).get("DNSName"),
                }
            )
        return {
            "zone": {
                "zone_id": zone_id,
                "name": zone.get("Name"),
                "private_zone": zone.get("Config", {}).get("PrivateZone"),
                "record_count": zone.get("ResourceRecordSetCount"),
            },
            "records": records,
        }

    def collect_lambda_and_logs(self) -> dict[str, Any]:
        payload = self.aws("lambda_functions", "lambda", "list-functions")
        functions = []
        function_names: set[str] = set()
        for function in (payload or {}).get("Functions", []):
            name = str(function.get("FunctionName", ""))
            if has_project_ownership(None, name, function.get("Description")) or "email-forward" in name.lower():
                function_names.add(name)
                functions.append(
                    {
                        "function_name": name,
                        "function_arn": function.get("FunctionArn"),
                        "runtime": function.get("Runtime"),
                        "memory_mib": function.get("MemorySize"),
                        "timeout_seconds": function.get("Timeout"),
                        "code_size_bytes": function.get("CodeSize"),
                        "last_modified": function.get("LastModified"),
                    }
                )

        log_payload = self.aws("cloudwatch_log_groups", "logs", "describe-log-groups")
        log_groups = []
        for group in (log_payload or {}).get("logGroups", []):
            name = str(group.get("logGroupName", ""))
            owned = any(function_name in name for function_name in function_names) or has_project_ownership(None, name)
            if owned:
                log_groups.append(
                    {
                        "log_group_name": name,
                        "stored_bytes": group.get("storedBytes"),
                        "retention_days": group.get("retentionInDays"),
                        "creation_time_epoch_ms": group.get("creationTime"),
                    }
                )
        return {"functions": functions, "log_groups": log_groups}

    def collect_load_balancers(self) -> list[dict[str, Any]]:
        payload = self.aws("elbv2_load_balancers", "elbv2", "describe-load-balancers")
        return [
            {
                "name": item.get("LoadBalancerName"),
                "arn": item.get("LoadBalancerArn"),
                "type": item.get("Type"),
                "scheme": item.get("Scheme"),
                "state": item.get("State", {}).get("Code"),
                "created_time": iso(item.get("CreatedTime")),
            }
            for item in (payload or {}).get("LoadBalancers", [])
            if has_project_ownership(None, item.get("LoadBalancerName"), item.get("DNSName"))
        ]

    def collect_tagged_resources(self) -> list[dict[str, Any]]:
        payload = self.aws(
            "tagged_excelsior_resources",
            "resourcegroupstaggingapi",
            "get-resources",
            (
                "--tag-filters",
                json.dumps(
                    [
                        {
                            "Key": "Project",
                            "Values": ["op-deckbuilder", "OverPower Deckbuilder", "Excelsior"],
                        }
                    ]
                ),
            ),
            optional=True,
        )
        resources = []
        for item in (payload or {}).get("ResourceTagMappingList", []):
            resources.append(
                {
                    "resource_arn": item.get("ResourceARN"),
                    "tags": compact_tags(item.get("Tags")),
                }
            )
        return resources

    def collect_cloudwatch_metrics(
        self,
        ec2: dict[str, Any],
        rds: dict[str, Any],
        s3: list[dict[str, Any]],
    ) -> dict[str, Any]:
        end = utc_now()
        start = end - dt.timedelta(days=14)
        queries: list[dict[str, Any]] = []
        metadata: dict[str, dict[str, Any]] = {}

        def add_query(
            query_id: str,
            namespace: str,
            metric_name: str,
            dimension_name: str,
            dimension_value: str,
            stat: str,
            unit: str | None = None,
        ) -> None:
            metric: dict[str, Any] = {
                "Namespace": namespace,
                "MetricName": metric_name,
                "Dimensions": [{"Name": dimension_name, "Value": dimension_value}],
            }
            stat_config: dict[str, Any] = {"Metric": metric, "Period": 3600, "Stat": stat}
            if unit:
                stat_config["Unit"] = unit
            queries.append({"Id": query_id, "MetricStat": stat_config, "ReturnData": True})
            metadata[query_id] = {
                "namespace": namespace,
                "metric": metric_name,
                "stat": stat,
                "dimension": {dimension_name: dimension_value},
            }

        for index, instance in enumerate(ec2.get("instances", [])):
            instance_id = instance.get("instance_id")
            if not instance_id:
                continue
            prefix = f"e{index}"
            add_query(f"{prefix}cpuavg", "AWS/EC2", "CPUUtilization", "InstanceId", instance_id, "Average")
            add_query(f"{prefix}cpumax", "AWS/EC2", "CPUUtilization", "InstanceId", instance_id, "Maximum")
            add_query(f"{prefix}creditmin", "AWS/EC2", "CPUCreditBalance", "InstanceId", instance_id, "Minimum")
            add_query(f"{prefix}statusmax", "AWS/EC2", "StatusCheckFailed", "InstanceId", instance_id, "Maximum")
            add_query(f"{prefix}netin", "AWS/EC2", "NetworkIn", "InstanceId", instance_id, "Sum")
            add_query(f"{prefix}netout", "AWS/EC2", "NetworkOut", "InstanceId", instance_id, "Sum")

        for index, instance in enumerate(rds.get("instances", [])):
            identifier = instance.get("identifier")
            if not identifier:
                continue
            prefix = f"r{index}"
            add_query(f"{prefix}cpuavg", "AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", identifier, "Average")
            add_query(f"{prefix}cpumax", "AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", identifier, "Maximum")
            add_query(f"{prefix}memmin", "AWS/RDS", "FreeableMemory", "DBInstanceIdentifier", identifier, "Minimum")
            add_query(f"{prefix}storagemin", "AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", identifier, "Minimum")
            add_query(f"{prefix}connmax", "AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", identifier, "Maximum")
            add_query(f"{prefix}readiops", "AWS/RDS", "ReadIOPS", "DBInstanceIdentifier", identifier, "Average")
            add_query(f"{prefix}writeiops", "AWS/RDS", "WriteIOPS", "DBInstanceIdentifier", identifier, "Average")

        for index, bucket in enumerate(s3):
            bucket_name = bucket.get("bucket_name")
            if not bucket_name:
                continue
            prefix = f"s{index}"
            queries.append(
                {
                    "Id": f"{prefix}bytes",
                    "MetricStat": {
                        "Metric": {
                            "Namespace": "AWS/S3",
                            "MetricName": "BucketSizeBytes",
                            "Dimensions": [
                                {"Name": "BucketName", "Value": bucket_name},
                                {"Name": "StorageType", "Value": "StandardStorage"},
                            ],
                        },
                        "Period": 86400,
                        "Stat": "Average",
                    },
                    "ReturnData": True,
                }
            )
            metadata[f"{prefix}bytes"] = {
                "namespace": "AWS/S3",
                "metric": "BucketSizeBytes",
                "stat": "Average",
                "dimension": {"BucketName": bucket_name, "StorageType": "StandardStorage"},
            }
            queries.append(
                {
                    "Id": f"{prefix}objects",
                    "MetricStat": {
                        "Metric": {
                            "Namespace": "AWS/S3",
                            "MetricName": "NumberOfObjects",
                            "Dimensions": [
                                {"Name": "BucketName", "Value": bucket_name},
                                {"Name": "StorageType", "Value": "AllStorageTypes"},
                            ],
                        },
                        "Period": 86400,
                        "Stat": "Average",
                    },
                    "ReturnData": True,
                }
            )
            metadata[f"{prefix}objects"] = {
                "namespace": "AWS/S3",
                "metric": "NumberOfObjects",
                "stat": "Average",
                "dimension": {"BucketName": bucket_name, "StorageType": "AllStorageTypes"},
            }

        if not queries:
            return {"window_days": 14, "metrics": []}
        payload = self.aws(
            "cloudwatch_utilization",
            "cloudwatch",
            "get-metric-data",
            (
                "--metric-data-queries",
                json.dumps(queries),
                "--start-time",
                start.isoformat(),
                "--end-time",
                end.isoformat(),
                "--scan-by",
                "TimestampAscending",
            ),
        )
        metrics = []
        for result in (payload or {}).get("MetricDataResults", []):
            query_id = result.get("Id")
            values = result.get("Values", [])
            summary = summarize_numbers(values)
            metric = {**metadata.get(query_id, {}), **summary, "status_code": result.get("StatusCode")}
            if metric.get("metric") in {
                "FreeableMemory",
                "FreeStorageSpace",
                "NetworkIn",
                "NetworkOut",
                "BucketSizeBytes",
            }:
                metric["mean_gib"] = (
                    summary["mean"] / (1024**3) if isinstance(summary["mean"], (int, float)) else None
                )
                metric["minimum_gib"] = (
                    summary["minimum"] / (1024**3)
                    if isinstance(summary["minimum"], (int, float))
                    else None
                )
                metric["maximum_gib"] = (
                    summary["maximum"] / (1024**3)
                    if isinstance(summary["maximum"], (int, float))
                    else None
                )
            metrics.append(metric)
        return {
            "start": start.isoformat(),
            "end": end.isoformat(),
            "window_days": 14,
            "memory_warning": "EC2 memory is not available unless the CloudWatch agent publishes it.",
            "metrics": metrics,
        }

    def collect_compute_optimizer(self, identity: dict[str, Any], ec2: dict[str, Any]) -> dict[str, Any] | None:
        arns = [
            f"arn:aws:ec2:{self.region}:{identity['account']}:instance/{instance_id}"
            for instance_id in ec2.get("known_instance_ids", [])
        ]
        if not arns:
            return None
        payload = self.aws(
            "compute_optimizer_ec2",
            "compute-optimizer",
            "get-ec2-instance-recommendations",
            ("--instance-arns", *arns, "--max-results", "20"),
            optional=True,
        )
        if not payload:
            return None
        return {
            "recommendations": [
                {
                    "instance_arn": item.get("instanceArn"),
                    "current_instance_type": item.get("currentInstanceType"),
                    "finding": item.get("finding"),
                    "lookback_period_hours": item.get("lookBackPeriodInHours"),
                    "options": [
                        {
                            "instance_type": option.get("instanceType"),
                            "performance_risk": option.get("performanceRisk"),
                            "rank": option.get("rank"),
                            "estimated_monthly_savings": option.get("savingsOpportunityAfterDiscounts", {})
                            .get("estimatedMonthlySavings", {})
                            .get("value"),
                            "estimated_savings_percentage": option.get("savingsOpportunityAfterDiscounts", {})
                            .get("savingsOpportunityPercentage"),
                        }
                        for option in item.get("recommendationOptions", [])[:5]
                    ],
                }
                for item in payload.get("instanceRecommendations", [])
            ],
            "errors": payload.get("errors", []),
        }

    def collect_reservation_recommendations(self) -> dict[str, Any]:
        recommendations: dict[str, Any] = {}
        for key, service in (
            ("ec2", "Amazon Elastic Compute Cloud - Compute"),
            ("rds", "Amazon Relational Database Service"),
        ):
            payload = self.aws(
                f"reservation_recommendation_{key}",
                "ce",
                "get-reservation-purchase-recommendation",
                (
                    "--service",
                    service,
                    "--lookback-period-in-days",
                    "SIXTY_DAYS",
                    "--term-in-years",
                    "ONE_YEAR",
                    "--payment-option",
                    "NO_UPFRONT",
                ),
                region=BILLING_REGION,
                optional=True,
            )
            if payload:
                rec = payload.get("Recommendations", [])
                recommendations[key] = {
                    "recommendation_count": len(rec),
                    "recommendations": rec[:10],
                    "warning": (
                        "Account-level official recommendation. Do not act unless it maps exactly to stable "
                        "Excelsior usage and the 60-day commitment policy is satisfied."
                    ),
                }
        return recommendations


class RepositoryIndex:
    ROOT_NAMES = ("infra", ".github", "scripts", "docs/current")
    ROOT_FILES = ("Dockerfile", ".dockerignore", "flyway.conf")
    TEXT_SUFFIXES = {
        ".tf",
        ".md",
        ".yml",
        ".yaml",
        ".json",
        ".sh",
        ".ts",
        ".js",
        ".conf",
        ".txt",
    }

    def __init__(self, repo_root: Path) -> None:
        self.repo_root = repo_root.resolve()
        self.files = list(self._files())

    def _files(self) -> Iterable[Path]:
        for root_name in self.ROOT_NAMES:
            root = self.repo_root / root_name
            if not root.exists():
                continue
            for path in root.rglob("*"):
                if path.is_file() and path.suffix.lower() in self.TEXT_SUFFIXES and path.stat().st_size <= 2_000_000:
                    yield path
        for file_name in self.ROOT_FILES:
            path = self.repo_root / file_name
            if path.is_file() and path.stat().st_size <= 2_000_000:
                yield path

    def find(self, token: str, limit: int = 12) -> list[dict[str, Any]]:
        if not token or len(token) < 4:
            return []
        matches: list[dict[str, Any]] = []
        for path in self.files:
            try:
                for line_number, line in enumerate(path.read_text(errors="ignore").splitlines(), start=1):
                    if token in line:
                        matches.append(
                            {"path": str(path.relative_to(self.repo_root)), "line": line_number}
                        )
                        if len(matches) >= limit:
                            return matches
            except OSError:
                continue
        return matches


def collect_reference_tokens(snapshot: dict[str, Any]) -> set[str]:
    tokens = {
        ACTIVE_ECR_REPOSITORY,
        LEGACY_ECR_REPOSITORY,
        RDS_IDENTIFIER,
        EC2_NAME,
        "excelsior.cards",
    }
    resources = snapshot.get("resources", {})
    for instance in resources.get("ec2", {}).get("instances", []):
        tokens.update(filter(None, [instance.get("instance_id"), instance.get("public_ip")]))
    for address in resources.get("ec2", {}).get("elastic_addresses", []):
        tokens.update(filter(None, [address.get("allocation_id"), address.get("public_ip")]))
    for bucket in resources.get("s3", []):
        tokens.add(str(bucket.get("bucket_name")))
    for distribution in resources.get("cloudfront", []):
        tokens.update(filter(None, [distribution.get("distribution_id"), distribution.get("domain_name")]))
    for function in resources.get("lambda_cloudwatch", {}).get("functions", []):
        tokens.add(str(function.get("function_name")))
    return {token for token in tokens if token and token != "None"}


def build_snapshot(args: argparse.Namespace) -> dict[str, Any]:
    collector = AwsCollector(args.region, args.expected_account, args.repo_root)
    identity = collector.collect_identity()
    today = utc_now().date()
    ec2 = collector.collect_ec2()
    rds = collector.collect_rds()
    s3 = collector.collect_s3()

    snapshot: dict[str, Any] = {
        "schema_version": 1,
        "generated_at_utc": utc_now().isoformat(),
        "scope": {
            "application": "Excelsior",
            "account_scope": "verified Excelsior-owned resources only",
            "minimum_actionable_monthly_savings_usd": 0.25,
            "mode": "read-only",
        },
        "identity": identity,
        "costs": collector.collect_costs(today),
        "resources": {
            "ec2": ec2,
            "rds": rds,
            "network_interfaces": collector.collect_network_interfaces(ec2, rds),
            "ecr": collector.collect_ecr(),
            "s3": s3,
            "cloudfront": collector.collect_cloudfront(),
            "route53": collector.collect_route53(),
            "lambda_cloudwatch": collector.collect_lambda_and_logs(),
            "load_balancers": collector.collect_load_balancers(),
            "tagged_resource_index": collector.collect_tagged_resources(),
        },
        "utilization": (
            {"skipped": True}
            if args.no_utilization
            else collector.collect_cloudwatch_metrics(ec2, rds, s3)
        ),
        "aws_recommendations": {
            "compute_optimizer": collector.collect_compute_optimizer(identity, ec2),
            "reservations": collector.collect_reservation_recommendations(),
        },
        "warnings": [
            "This snapshot contains evidence, not authorization to change AWS.",
            "Empty results are meaningful only for calls whose coverage status is ok.",
            "Account-level billing totals must be reconciled to owned resources before attribution.",
        ],
    }

    index = RepositoryIndex(args.repo_root)
    snapshot["repository_references"] = {
        token: index.find(token) for token in sorted(collect_reference_tokens(snapshot))
    }
    snapshot["coverage"] = {
        "calls": [record.__dict__ for record in collector.calls],
        "ok": sum(record.status == "ok" for record in collector.calls),
        "unavailable": sum(record.status == "unavailable" for record in collector.calls),
        "failed": sum(record.status == "failed" for record in collector.calls),
        "interpretation": (
            "failed/unavailable calls are coverage gaps and must not be interpreted as resource absence"
        ),
    }
    return snapshot


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    script_path = Path(__file__).resolve()
    default_repo_root = script_path.parents[4]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--region", default=PRIMARY_REGION)
    parser.add_argument("--expected-account", default=EXPECTED_ACCOUNT)
    parser.add_argument("--repo-root", type=Path, default=default_repo_root)
    parser.add_argument("--no-utilization", action="store_true", help="Skip CloudWatch utilization collection")
    parser.add_argument("--pretty", action="store_true", help="Pretty-print JSON instead of compact JSON")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    if not shutil.which("aws"):
        print(json.dumps({"fatal": "AWS CLI is not installed or not on PATH"}))
        return 2
    if not args.repo_root.is_dir():
        print(json.dumps({"fatal": f"Repository root does not exist: {args.repo_root}"}))
        return 2
    try:
        snapshot = build_snapshot(args)
    except RuntimeError as exc:
        print(json.dumps({"fatal": str(exc), "mode": "read-only"}))
        return 2
    print(
        json.dumps(
            snapshot,
            indent=2 if args.pretty else None,
            separators=None if args.pretty else (",", ":"),
            default=iso,
            sort_keys=args.pretty,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
