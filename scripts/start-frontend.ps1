param()

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$frontendDir = Join-Path $root "frontend-vue"
$runDir = Join-Path $root ".run"
$logDir = Join-Path $root "logs"

New-Item -ItemType Directory -Force -Path $runDir | Out-Null
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$pidFile = Join-Path $runDir "frontend-vue.pid"
$logFile = Join-Path $logDir "frontend-vue.log"

if (Test-Path $pidFile) {
  $existingPid = Get-Content $pidFile -ErrorAction SilentlyContinue
  if ($existingPid) {
    try {
      taskkill /F /T /PID $existingPid | Out-Null
    } catch {
      Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }
  }
}

$cmd = "cd /d `"$frontendDir`"&& npm run dev -- --host 0.0.0.0 --port 5173 > `"$logFile`" 2>&1"
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -PassThru
Set-Content -Path $pidFile -Value $proc.Id -Encoding ASCII

Write-Host "frontend-vue started. PID=$($proc.Id)"
Write-Host "Log: $logFile"
