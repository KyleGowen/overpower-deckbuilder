#!/usr/bin/env python3
"""Run the Excelsior Trivy CI filesystem scan with a fresh DB.

This wrapper avoids macOS Docker Desktop credential-helper failures when Trivy
pulls public vulnerability DB OCI artifacts by using an empty temporary
DOCKER_CONFIG and an isolated cache directory.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path


DEFAULT_REPO = "public.ecr.aws/aquasecurity/trivy-db"


def repo_root(start: Path) -> Path:
    current = start.resolve()
    for candidate in (current, *current.parents):
        if (candidate / ".github" / "workflows" / "deploy.yml").exists():
            return candidate
    raise SystemExit("Could not find repo root with .github/workflows/deploy.yml")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the Trivy CI scan locally.")
    parser.add_argument("--repo", default=".", help="Repository root or path inside it.")
    parser.add_argument(
        "--db-repository",
        default=DEFAULT_REPO,
        help="Trivy DB repository to use for fresh DB downloads.",
    )
    parser.add_argument(
        "--cache-dir",
        default="",
        help="Optional Trivy cache dir. Defaults to a temp dir.",
    )
    parser.add_argument(
        "--format",
        choices=("table", "json"),
        default="table",
        help="Trivy output format.",
    )
    args = parser.parse_args()

    root = repo_root(Path(args.repo))
    cache_dir = Path(args.cache_dir).resolve() if args.cache_dir else None

    with tempfile.TemporaryDirectory(prefix="trivy-docker-config-") as docker_tmp:
        docker_config = Path(docker_tmp)
        (docker_config / "config.json").write_text("{}\n", encoding="utf-8")

        if cache_dir is None:
            cache_context = tempfile.TemporaryDirectory(prefix="trivy-cache-")
            cache_path = Path(cache_context.name)
        else:
            cache_context = None
            cache_path = cache_dir
            cache_path.mkdir(parents=True, exist_ok=True)

        try:
            env = os.environ.copy()
            env["DOCKER_CONFIG"] = str(docker_config)

            cmd = [
                "trivy",
                "fs",
                "--cache-dir",
                str(cache_path),
                "--db-repository",
                args.db_repository,
                "--ignorefile",
                ".trivyignore",
                "--severity",
                "CRITICAL,HIGH,MEDIUM,LOW,UNKNOWN",
                "--exit-code",
                "1",
                "--ignore-unfixed",
                "--scanners",
                "vuln",
            ]

            if args.format == "json":
                cmd.extend(["--format", "json"])

            cmd.append(".")

            print("Running:", " ".join(cmd), file=sys.stderr)
            print(f"Repo: {root}", file=sys.stderr)
            print(f"DOCKER_CONFIG: {docker_config}", file=sys.stderr)
            print(f"TRIVY cache: {cache_path}", file=sys.stderr)

            result = subprocess.run(cmd, cwd=root, env=env)
            return result.returncode
        finally:
            if cache_context is not None:
                cache_context.cleanup()


if __name__ == "__main__":
    raise SystemExit(main())
