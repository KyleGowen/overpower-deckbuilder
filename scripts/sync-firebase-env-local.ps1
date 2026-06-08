# Sync Firebase credentials from AWS SSM into local .env + service account file.
# Requires AWS CLI configured with access to us-west-2 SSM parameters.
#
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File scripts/sync-firebase-env-local.ps1
#
# Writes/updates in .env:
#   FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_APP_ID
# Also writes: infra/firebase-service-account.json (for Firebase Admin token verify)

$ErrorActionPreference = 'Stop'
$Region = 'us-west-2'
$Prefix = '/op-deckbuilder/dev/firebase'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EnvFile = Join-Path $Root '.env'
$SaFile = Join-Path $Root 'infra\firebase-service-account.json'

function Find-AwsCli {
    $candidates = @(
        'aws',
        'C:\Program Files\Amazon\AWSCLIV2\aws.exe',
        'C:\Program Files (x86)\Amazon\AWSCLIV2\aws.exe'
    )
    foreach ($c in $candidates) {
        if (Get-Command $c -ErrorAction SilentlyContinue) { return (Get-Command $c).Source }
    }
    return $null
}

$aws = Find-AwsCli
if (-not $aws) {
    Write-Error "AWS CLI not found. Install AWS CLI v2, configure credentials, then re-run this script."
}

function Get-SsmParam([string]$Name, [switch]$Secure) {
    $args = @('ssm', 'get-parameter', '--name', $Name, '--region', $Region, '--query', 'Parameter.Value', '--output', 'text')
    if ($Secure) { $args += '--with-decryption' }
    $val = & $aws @args 2>$null
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($val)) { return $null }
    return $val.Trim()
}

Write-Host "Fetching Firebase config from SSM ($Prefix/*) ..."
$apiKey = Get-SsmParam "$Prefix/api_key"
$authDomain = Get-SsmParam "$Prefix/auth_domain"
$projectId = Get-SsmParam "$Prefix/project_id"
$appId = Get-SsmParam "$Prefix/app_id"
$saJson = Get-SsmParam "$Prefix/service_account_json" -Secure

if (-not $apiKey) { Write-Error "Could not fetch $Prefix/api_key from SSM." }

# Update .env (remove old FIREBASE_* lines, append fresh ones)
$lines = @()
if (Test-Path $EnvFile) {
    $lines = Get-Content $EnvFile | Where-Object { $_ -notmatch '^FIREBASE_' -and $_ -notmatch '^# Firebase' }
}
$lines += ''
$lines += '# Firebase (Google Sign-In) — synced from AWS SSM'
$lines += "FIREBASE_API_KEY=$apiKey"
$lines += "FIREBASE_AUTH_DOMAIN=$authDomain"
$lines += "FIREBASE_PROJECT_ID=$projectId"
$lines += "FIREBASE_APP_ID=$appId"
Set-Content -Path $EnvFile -Value ($lines -join "`n") -Encoding UTF8
Write-Host "Updated $EnvFile"

if ($saJson) {
    $parsed = $saJson | ConvertFrom-Json
    $pretty = $parsed | ConvertTo-Json -Depth 10 -Compress:$false
    New-Item -ItemType Directory -Force -Path (Split-Path $SaFile) | Out-Null
    Set-Content -Path $SaFile -Value $pretty -Encoding UTF8
    Write-Host "Wrote $SaFile"
} else {
    Write-Warning 'Service account not fetched. Google popup will work but server token verify will 503 until infra/firebase-service-account.json exists.'
}

Write-Host 'Done. Restart dev server: npm run dev'
