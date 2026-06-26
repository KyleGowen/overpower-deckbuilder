# Restore stat icons from _backup-2026-06-25-preview (user preview rollback).
# Usage: pwsh scripts/revert-stat-icon-preview.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$iconDir = Join-Path $root 'src/resources/images/icons'
$backup = Join-Path $iconDir '_backup-2026-06-25-preview'
$publicThreat = Join-Path $root 'public/resources/images/icons/threat.png'

if (-not (Test-Path $backup)) {
    Write-Error "Backup folder not found: $backup"
}

$files = @('energy.png', 'combat.png', 'brute_force.png', 'intelligence.png', 'any-power.png', 'threat.png')
foreach ($f in $files) {
    Copy-Item (Join-Path $backup $f) (Join-Path $iconDir $f) -Force
    Write-Host "Restored $f"
}

$publicBackup = Join-Path $backup 'public-threat.png'
if (Test-Path $publicBackup) {
    Copy-Item $publicBackup $publicThreat -Force
    Write-Host 'Restored public/resources/images/icons/threat.png'
}

Write-Host 'Stat icon preview reverted to pre-2026-06-25 originals.'
