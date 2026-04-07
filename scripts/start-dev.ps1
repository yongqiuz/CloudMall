param(
  [switch]$NoWindow
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$eurekaDir = Join-Path $root "eureka-server"
$schemaDir = Join-Path $root "springboot-schema"
$runDir = Join-Path $root ".run"
$logDir = Join-Path $root "logs"

New-Item -ItemType Directory -Force -Path $runDir | Out-Null
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Get-PrimaryIpv4 {
  $ip = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.InterfaceOperationalStatus -eq "Up"
    } |
    Select-Object -First 1 -ExpandProperty IPAddress

  if (-not $ip) {
    $ip = "127.0.0.1"
  }
  return $ip
}

function Start-ServiceProcess {
  param(
    [string]$Name,
    [string]$WorkingDirectory,
    [string]$LogFile,
    [string]$Command,
    [string]$PidFile
  )

  if (Test-Path $PidFile) {
    $existingPid = Get-Content $PidFile -ErrorAction SilentlyContinue
    if ($existingPid) {
      try {
        taskkill /F /T /PID $existingPid | Out-Null
      } catch {
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
      }
    }
  }

  $proc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", $Command `
    -WorkingDirectory $WorkingDirectory `
    -PassThru

  Set-Content -Path $PidFile -Value $proc.Id -Encoding ASCII
  Write-Host "$Name started. PID=$($proc.Id)"
}

$hostIp = Get-PrimaryIpv4

$eurekaCmd = "set HOST_IP=$hostIp&& cd /d `"$eurekaDir`"&& mvn spring-boot:run > `"$logDir\eureka-server.log`" 2>&1"
$schemaCmd = "set HOST_IP=$hostIp&& set EUREKA_HOST=$hostIp&& cd /d `"$schemaDir`"&& mvn spring-boot:run > `"$logDir\springboot-schema.log`" 2>&1"

Start-ServiceProcess -Name "eureka-server" -WorkingDirectory $eurekaDir -LogFile (Join-Path $logDir "eureka-server.log") -Command $eurekaCmd -PidFile (Join-Path $runDir "eureka-server.pid")
Start-ServiceProcess -Name "springboot-schema" -WorkingDirectory $schemaDir -LogFile (Join-Path $logDir "springboot-schema.log") -Command $schemaCmd -PidFile (Join-Path $runDir "springboot-schema.pid")

Write-Host "HOST_IP=$hostIp"
Write-Host "Logs are in $logDir"
