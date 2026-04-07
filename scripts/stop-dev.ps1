param()

$ErrorActionPreference = "Continue"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$runDir = Join-Path $root ".run"

function Stop-RecordedProcess {
  param([string]$PidFile, [string]$Name)

  if (Test-Path $PidFile) {
    $pid = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($pid) {
      try {
        taskkill /F /T /PID $pid | Out-Null
        Write-Host "$Name stopped. PID=$pid"
      } catch {
        Write-Host "$Name may not be running. PID=$pid"
      }
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  }
}

Stop-RecordedProcess -PidFile (Join-Path $runDir "springboot-schema.pid") -Name "springboot-schema"
Stop-RecordedProcess -PidFile (Join-Path $runDir "eureka-server.pid") -Name "eureka-server"

$ports = 8761, 8080
foreach ($port in $ports) {
  try {
    $pids = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
      try {
        taskkill /F /T /PID $pid | Out-Null
        Write-Host "Stopped process on port $port. PID=$pid"
      } catch {
        Write-Host "No running process to stop on port $port"
      }
    }
  } catch {
    Write-Host "Port check unavailable for $port"
  }
}

Write-Host "Stop complete."
