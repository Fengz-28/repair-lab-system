param(
  [int]$Port = 3001,
  [string]$HealthUrl = "http://localhost:3001/api/health",
  [int]$MinimumFreeGb = 10
)

$ErrorActionPreference = "Continue"
$failures = 0
$warnings = 0

function Write-Check {
  param([string]$Status, [string]$Message)
  Write-Output "[$Status] $Message"
}

function Add-Failure {
  param([string]$Message)
  $script:failures++
  Write-Check "FAIL" $Message
}

function Add-Warning {
  param([string]$Message)
  $script:warnings++
  Write-Check "WARN" $Message
}

function Add-Ok {
  param([string]$Message)
  Write-Check "OK" $Message
}

function Show-LatestBackup {
  param([string]$Label, [string]$Directory, [string]$Pattern)

  if (-not (Test-Path $Directory)) {
    Add-Warning ("{0} backup directory missing: {1}" -f $Label, $Directory)
    return
  }

  $latest = Get-ChildItem -Path $Directory -Filter $Pattern -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($latest) {
    Add-Ok ("{0} latest backup: {1}, {2}" -f $Label, $latest.Name, $latest.LastWriteTime.ToString("s"))
  } else {
    Add-Warning ("{0} backup not found in {1}." -f $Label, $Directory)
  }
}

Write-Output "FengzLab local production readiness check"
Write-Output ("Port: {0}" -f $Port)
Write-Output ("Health URL: {0}" -f $HealthUrl)
Write-Output ""

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
  Add-Ok ("Node available: {0}" -f $node.Source)
  node --version
} else {
  Add-Failure "Node.js is not available in PATH."
}

$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
  Add-Ok ("npm available: {0}" -f $npm.Source)
  npm --version
} else {
  Add-Failure "npm is not available in PATH."
}

if (Test-Path ".next") {
  Add-Ok "Production build folder exists: .next"
} else {
  Add-Warning "Production build folder .next is missing. Run npm run build before npm run start."
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  Add-Ok "Docker CLI available."
  try {
    $dockerInfo = docker ps --format "{{.Names}}" 2>$null
    if ($LASTEXITCODE -eq 0) {
      if ($dockerInfo -match "postgres|repair_lab_postgres") {
        Add-Ok "A PostgreSQL-looking Docker container is running."
      } else {
        Add-Warning "Docker is running, but no PostgreSQL-looking container name was found."
      }
    } else {
      Add-Warning "Docker CLI is installed, but Docker does not appear reachable."
    }
  } catch {
    Add-Warning ("Docker status check failed: {0}" -f $_.Exception.Message)
  }
} else {
  Add-Warning "Docker CLI is not available in PATH. If PostgreSQL runs another way, verify it manually."
}

$cloudflaredCommand = Get-Command cloudflared -ErrorAction SilentlyContinue
$cloudflaredService = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredCommand) {
  Add-Ok ("cloudflared CLI available: {0}" -f $cloudflaredCommand.Source)
} else {
  Add-Warning "cloudflared CLI not found in PATH. If installed as service elsewhere, verify manually."
}
if ($cloudflaredService) {
  if ($cloudflaredService.Status -eq "Running") {
    Add-Ok "cloudflared service is running."
  } else {
    Add-Warning ("cloudflared service exists but is {0}." -f $cloudflaredService.Status)
  }
} else {
  Add-Warning "cloudflared service not found by Get-Service. If using a manual tunnel process, verify manually."
}

$portInUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($portInUse) {
  Add-Ok ("Port {0} has a listener." -f $Port)
} else {
  Add-Warning ("Port {0} has no listener right now. Start the app before routing tunnel traffic." -f $Port)
}

try {
  $health = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
  Add-Ok ("/api/health responded with HTTP {0}." -f $health.StatusCode)
} catch {
  Add-Warning ("/api/health is not reachable now: {0}" -f $_.Exception.Message)
}

try {
  $driveRoot = (Get-Location).Path.Substring(0, 3)
  $drive = Get-PSDrive -Name $driveRoot.Substring(0, 1)
  $freeGb = [math]::Round($drive.Free / 1GB, 1)
  if ($freeGb -lt $MinimumFreeGb) {
    Add-Failure ("Low disk space on {0}: {1}GB free." -f $driveRoot, $freeGb)
  } else {
    Add-Ok ("Disk space on {0}: {1}GB free." -f $driveRoot, $freeGb)
  }
} catch {
  Add-Warning ("Disk free space check failed: {0}" -f $_.Exception.Message)
}

if (Test-Path "backups") {
  Add-Ok "Backup folder exists: backups"
} else {
  Add-Warning "Backup folder does not exist yet. Run backups before production use."
}

Show-LatestBackup "PostgreSQL" "backups/postgres" "repairlab-postgres-*.sql.gz"
Show-LatestBackup "Private storage" "backups/storage" "repairlab-storage-*.tar.gz"

Write-Output ""
Write-Check "REMINDER" "Disable sleep during service hours and control Windows restart/update windows."
Write-Check "REMINDER" "Use UPS/power backup for workstation, router, and modem when possible."
Write-Check "REMINDER" "Copy backups outside this workstation; local-only backups are not enough."

if ($failures -gt 0) {
  Write-Output ""
  Write-Output ("Readiness check finished with {0} failure(s) and {1} warning(s)." -f $failures, $warnings)
  exit 1
}

Write-Output ""
Write-Output ("Readiness check finished with 0 failures and {0} warning(s)." -f $warnings)
