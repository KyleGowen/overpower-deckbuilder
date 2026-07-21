#!/usr/bin/env python3
"""Start/reuse Excelsior local dev servers and print health status."""

from __future__ import annotations

import json
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()
FRONTEND = ROOT / "frontend"
API_HEALTH = "http://localhost:8085/health"
FRONTEND_URL = "http://localhost:5173"


def port_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
      sock.settimeout(0.25)
      return sock.connect_ex(("127.0.0.1", port)) == 0


def fetch(url: str, timeout: float = 2.0) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "codex-start-excelsior"})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def start_process(name: str, cwd: Path) -> subprocess.Popen[str]:
    log_dir = Path("/tmp") / "excelsior-start-excelsior"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / f"{name}.log"
    log = log_path.open("a", encoding="utf-8")
    process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(cwd),
        stdout=log,
        stderr=subprocess.STDOUT,
        text=True,
        start_new_session=True,
    )
    print(f"Started {name} dev server (pid {process.pid}); log: {log_path}")
    return process


def wait_for_health(deadline_seconds: int = 45) -> dict:
    deadline = time.time() + deadline_seconds
    last_error = ""
    while time.time() < deadline:
        try:
            status, body = fetch(API_HEALTH, timeout=3.0)
            if status == 200:
                return json.loads(body)
            last_error = f"HTTP {status}"
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = str(exc)
        time.sleep(1)
    raise RuntimeError(f"Health check did not pass within {deadline_seconds}s: {last_error}")


def wait_for_frontend(deadline_seconds: int = 20) -> int:
    deadline = time.time() + deadline_seconds
    last_status = 0
    while time.time() < deadline:
        try:
            status, _ = fetch(FRONTEND_URL, timeout=2.0)
            return status
        except urllib.error.HTTPError as exc:
            last_status = exc.code
        except (urllib.error.URLError, TimeoutError):
            pass
        time.sleep(1)
    return last_status


def print_health(health: dict, frontend_status: int) -> None:
    db = health.get("database", {})
    git = health.get("git", {})
    latest = (db.get("migrations") or {}).get("latest") or {}
    uptime = int(float(health.get("uptime", 0)))
    print()
    print("Server Health Check")
    print(f"Status: {health.get('status', 'UNKNOWN')}")
    print(f"Uptime: {uptime // 3600}h {(uptime % 3600) // 60}m {uptime % 60}s")
    print(f"Database: {db.get('status', 'UNKNOWN')} ({db.get('latency', 'N/A')})")
    print(f"Response Time: {health.get('latency', 'N/A')}")
    print(f"Environment: {health.get('environment', 'unknown')}")
    print(f"Latest Git Commit: {git.get('shortCommit', 'unknown')} - {git.get('commitMessage', 'unknown')}")
    if latest:
        print(f"Latest Migration: V{latest.get('version', '?')} - {latest.get('description', 'unknown')}")
    print(f"Frontend: HTTP {frontend_status or 'unverified'} at {FRONTEND_URL}")


def main() -> int:
    if not (ROOT / "package.json").exists() or not FRONTEND.exists():
        print(f"Not an Excelsior repo root: {ROOT}", file=sys.stderr)
        return 2

    if not port_open(8085):
        start_process("api", ROOT)
    else:
        print("API already appears to be listening on 8085; reusing it.")

    if not port_open(5173):
        start_process("frontend", FRONTEND)
    else:
        print("Frontend already appears to be listening on 5173; reusing it.")

    health = wait_for_health()
    frontend_status = wait_for_frontend()
    print_health(health, frontend_status)
    return 0 if health.get("status") == "OK" and frontend_status == 200 else 1


if __name__ == "__main__":
    raise SystemExit(main())
