param()

$ErrorActionPreference = "Continue"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$runDir = Join-Path $root ".run"

$pidFile = Join-Path $runDir "frontend-vue.pid"

if (Test-Path $pidFile) {
  $pid = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($pid) {
    try {
      taskkill /F /T /PID $pid | Out-Null
      Write-Host "frontend-vue stopped. PID=$pid"
    } catch {
      Write-Host "frontend-vue may not be running. PID=$pid"
    }
  }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

try {
  $pids = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pid in $pids) {
    try {
      taskkill /F /T /PID $pid | Out-Null
      Write-Host "Stopped process on port 5173. PID=$pid"
    } catch {
      Write-Host "No running process to stop on port 5173"
    }
  }
} catch {
  Write-Host "Port check unavailable for 5173"
}

Write-Host "Frontend stop complete."
