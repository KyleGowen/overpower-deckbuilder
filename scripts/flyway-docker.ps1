# Run Flyway via the official Docker image against local overpower-postgres (:1337).
# Use when Flyway CLI is not installed on the host (Windows dev setup).
param(
    [Parameter(Position = 0)]
    [string]$Command = "migrate"
)

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

docker run --rm `
    -v "${Root}:/workspace" `
    -w /workspace `
    flyway/flyway:latest `
    "-configFiles=conf/flyway.docker.conf" `
    $Command
