#Requires -Version 5.1
<#
.SYNOPSIS
  Convert image PDF(s) to PNG at native resolution via Docker Poppler.

.PARAMETER InputPdf
  Path to the source PDF file.

.PARAMETER OutputDir
  Optional directory for PNG output. Defaults to the PDF's directory.

.PARAMETER OutputFileName
  Optional output filename (must end with .png). Single-page PDFs use this
  name exactly. Multi-page PDFs use {basename}-{n}.png.

.OUTPUTS
  JSON with conversion details (paths, dpi, dimensions).
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$InputPdf,

    [Parameter(Mandatory = $false)]
    [string]$OutputDir,

    [Parameter(Mandatory = $false)]
    [string]$OutputFileName
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Convert-SlashPath {
    param([string]$Path)
    if ([string]::IsNullOrWhiteSpace($Path)) { return $Path }
    $normalized = $Path.Trim().Replace('\', '/')
    if ($normalized -match '^/([a-zA-Z])/(.*)$') {
        return ("{0}:\{1}" -f $Matches[1].ToUpper(), ($Matches[2] -replace '/', '\'))
    }
    return $Path
}

function Get-DockerVolumePath {
    param([string]$Path)
    $resolved = (Resolve-Path -LiteralPath $Path).Path
    return ($resolved -replace '\\', '/')
}

function Invoke-Poppler {
    param(
        [hashtable]$VolumeMounts,
        [string[]]$PopplerArgs
    )
    $dockerArgs = @('run', '--rm')
    foreach ($mount in ($VolumeMounts.GetEnumerator() | Sort-Object Name)) {
        $hostPath = Get-DockerVolumePath -Path $mount.Value
        $dockerArgs += @('-v', "${hostPath}:/$($mount.Name)")
    }
    $dockerArgs += 'minidocks/poppler'
    $dockerArgs += $PopplerArgs
    $output = & docker @dockerArgs 2>&1 | ForEach-Object { "$_" }
    if ($LASTEXITCODE -ne 0) {
        throw "Poppler command failed: $($output -join [Environment]::NewLine)"
    }
    return ($output -join [Environment]::NewLine)
}

function Get-NativeDpi {
    param(
        [string]$PdfHostPath,
        [string]$PdfDir
    )

    $pdfName = Split-Path -Leaf $PdfHostPath
    $mounts = @{ in = $PdfDir }
    $listText = Invoke-Poppler -VolumeMounts $mounts -PopplerArgs @('pdfimages', '-list', "/in/$pdfName")
    $infoText = Invoke-Poppler -VolumeMounts $mounts -PopplerArgs @('pdfinfo', "/in/$pdfName")

    $pageSizeMatch = [regex]::Match($infoText, 'Page size:\s+([0-9.]+)\s+x\s+([0-9.]+)\s+pts')
    if (-not $pageSizeMatch.Success) {
        throw 'Could not read PDF page size from pdfinfo.'
    }
    $pageWidthPts = [double]$pageSizeMatch.Groups[1].Value
    $pageHeightPts = [double]$pageSizeMatch.Groups[2].Value

    $images = @()
    foreach ($line in ($listText -split "`n")) {
        if ($line -match '^\s*(\d+)\s+(\d+)\s+image\s+(\d+)\s+(\d+)\s+\S+\s+\d+\s+\d+\s+\S+\s+\S+\s+\d+\s+\d+\s+(\d+)\s+(\d+)') {
            $images += [pscustomobject]@{
                Page = [int]$Matches[1]
                Width = [int]$Matches[3]
                Height = [int]$Matches[4]
                XPpi = [int]$Matches[5]
                YPpi = [int]$Matches[6]
            }
        }
    }

    if ($images.Count -eq 0) {
        return 300
    }

    $largest = $images | Sort-Object { $_.Width * $_.Height } -Descending | Select-Object -First 1

    if ($largest.XPpi -gt 0 -and $largest.YPpi -gt 0) {
        return [int][math]::Min($largest.XPpi, $largest.YPpi)
    }

    $dpiFromPixels = [math]::Min(
        $largest.Width / ($pageWidthPts / 72.0),
        $largest.Height / ($pageHeightPts / 72.0)
    )
    return [int][math]::Floor($dpiFromPixels)
}

$InputPdf = Convert-SlashPath -Path $InputPdf
if (-not (Test-Path -LiteralPath $InputPdf)) {
    throw "Input PDF not found: $InputPdf"
}

if ($OutputDir) {
    $OutputDir = Convert-SlashPath -Path $OutputDir
    if (-not (Test-Path -LiteralPath $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }
    $OutputDir = (Resolve-Path -LiteralPath $OutputDir).Path
} else {
    $OutputDir = (Resolve-Path -LiteralPath (Split-Path -Parent $InputPdf)).Path
}

if ($OutputFileName -and $OutputFileName -notmatch '\.png$') {
    throw 'OutputFileName must end with .png'
}

$pdfBaseName = [System.IO.Path]::GetFileNameWithoutExtension((Split-Path -Leaf $InputPdf))
$pdfDir = (Resolve-Path -LiteralPath (Split-Path -Parent $InputPdf)).Path
$dpi = Get-NativeDpi -PdfHostPath $InputPdf -PdfDir $pdfDir

$prefixBase = if ($OutputFileName) {
    [System.IO.Path]::GetFileNameWithoutExtension($OutputFileName)
} else {
    $pdfBaseName
}

$tempPrefix = "_pdf2png_$([guid]::NewGuid().ToString('N'))"
$pdfLeaf = Split-Path -Leaf $InputPdf
$convertMounts = @{ in = $pdfDir; out = $OutputDir }
Invoke-Poppler -VolumeMounts $convertMounts -PopplerArgs @(
    'pdftoppm',
    '-png',
    '-r', "$dpi",
    "/in/$pdfLeaf",
    "/out/$tempPrefix"
) | Out-Null

# pdftoppm names outputs {prefix}-{page}.png using the prefix basename only
$generated = @(Get-ChildItem -LiteralPath $OutputDir -Filter "$tempPrefix-*.png" | Sort-Object Name)
if ($generated.Count -eq 0) {
    throw 'Conversion produced no PNG files.'
}

$outputFiles = @()
$pageCount = $generated.Count

for ($i = 0; $i -lt $pageCount; $i++) {
    $pageNum = $i + 1
    $targetName = if ($pageCount -eq 1 -and $OutputFileName) {
        $OutputFileName
    } elseif ($pageCount -eq 1) {
        "$pdfBaseName.png"
    } elseif ($OutputFileName) {
        "$prefixBase-$pageNum.png"
    } else {
        "$pdfBaseName-$pageNum.png"
    }

    $targetPath = Join-Path $OutputDir $targetName
    if (Test-Path -LiteralPath $targetPath) {
        Remove-Item -LiteralPath $targetPath -Force
    }
    Move-Item -LiteralPath $generated[$i].FullName -Destination $targetPath
    $outputFiles += $targetPath
}

$result = [ordered]@{
    success = $true
    inputPdf = $InputPdf
    outputDir = $OutputDir
    dpi = $dpi
    pageCount = $pageCount
    outputFiles = $outputFiles
}

$result | ConvertTo-Json -Depth 4
