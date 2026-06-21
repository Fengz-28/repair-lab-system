param(
  [int]$Port = 3001
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".next")) {
  Write-Error "Production build folder .next is missing. Run npm run build before starting production mode."
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  Write-Error "Port $Port is already in use. Stop the existing process or choose a different port."
}

Write-Output "Starting FengzLab local production server on port $Port."
Write-Output "This script does not modify services, firewall rules, Cloudflare, DNS, or .env."
& npm run start -- -p $Port
