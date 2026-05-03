param(
    [Parameter(Mandatory=$true)][string]$FileToBackup,
    [Parameter(Mandatory=$true)][string]$AuditMessage
)

$archiveDir = ".\archive"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null
}

$fileInfo = Get-Item $FileToBackup
$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$prettyDate = Get-Date -Format "yyyy-MM-dd hh:mm tt"

$newName = "{0}_{1}{2}" -f $fileInfo.BaseName, $timestamp, $fileInfo.Extension
$destPath = Join-Path $archiveDir $newName

Copy-Item -Path $FileToBackup -Destination $destPath -Force

$readmePath = ".\README_entry_log.md"
$logEntry = "| [$prettyDate] | $destPath | $AuditMessage |"

Add-Content -Path $readmePath -Value $logEntry

Write-Host "Backed up to $destPath and logged to README."
