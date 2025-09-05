Param(
  [int]$FrontendPort = 3000,
  [int]$BackendPort = 3001,
  [switch]$SkipBackend = $false,
  [switch]$Setup = $true,
  [switch]$Demo = $false,
  [string]$BindHost = '::'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Stop-Port {
  Param([int]$Port)
  try {
    $pids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique
    if ($pids) {
      Write-Host "Stopping processes on port ${Port}: $($pids -join ', ')"
      foreach ($pid in $pids) { try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {} }
    }
  } catch {}
}

function Wait-Health {
  Param([string]$Url, [int]$TimeoutSec = 40)
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    try {
      $res = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
      if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 500) { return $true }
    } catch {}
    Start-Sleep -Milliseconds 800
  }
  return $false
}

Write-Host "Cleaning ports $FrontendPort and $BackendPort..."
Stop-Port -Port $FrontendPort
Stop-Port -Port $BackendPort

# Start Rails backend (port $BackendPort)
$backendUrl = "http://localhost:$BackendPort"
$railsProc = $null
if (-not $SkipBackend) {
  $railsDir = Resolve-Path 'drift-rails'
  Write-Host "Starting Rails backend in $railsDir on $BackendPort..."
  if ($Setup) {
    try {
      Write-Host "Ensuring Ruby dependencies (bundle install) ..."
      Start-Process -FilePath 'bundle' -ArgumentList 'install' -WorkingDirectory $railsDir -Wait -NoNewWindow | Out-Null
    } catch { Write-Warning "bundle install failed: $_" }
    try {
      Write-Host "Preparing database (db:prepare) ..."
      Start-Process -FilePath 'bundle' -ArgumentList 'exec rails db:prepare' -WorkingDirectory $railsDir -Wait -NoNewWindow | Out-Null
      Write-Host "Seeding database (db:seed) ..."
      Start-Process -FilePath 'bundle' -ArgumentList 'exec rails db:seed' -WorkingDirectory $railsDir -Wait -NoNewWindow | Out-Null
    } catch { Write-Warning "db tasks failed: $_" }
  }

  $railsCmd = 'bundle'
  $railsArgs = "exec rails s -p $BackendPort"
  $railsProc = Start-Process -FilePath $railsCmd -ArgumentList $railsArgs -WorkingDirectory $railsDir -PassThru -WindowStyle Minimized

  if (Wait-Health -Url ("$backendUrl/health")) {
    Write-Host "Rails backend healthy at $backendUrl"
  } else {
    Write-Warning "Backend health check timed out. Continuing anyway... ($backendUrl/health)"
  }
}

# Start Next.js frontend (port $FrontendPort)
$webDir = Resolve-Path 'drift-web-clean'
Write-Host "Starting Next.js in $webDir on $FrontendPort..."
$hasNodeModules = Test-Path (Join-Path $webDir 'node_modules')
if ($Setup -and -not $hasNodeModules) {
  try {
    Write-Host "Installing frontend dependencies (npm install) ..."
    Start-Process -FilePath 'npm' -ArgumentList 'install' -WorkingDirectory $webDir -Wait -NoNewWindow | Out-Null
  } catch { Write-Warning "npm install failed: $_" }
}
$env:BACKEND_URL = $backendUrl
# Enable demo mode if explicitly requested or when backend is skipped
if ($SkipBackend -or $Demo) { $env:NEXT_PUBLIC_DEMO_MODE = 'true' } else { $env:NEXT_PUBLIC_DEMO_MODE = 'false' }
# Provide analyzer URL to the Next.js API proxy (FastAPI default 8000)
if (-not $env:ANALYZER_URL) { $env:ANALYZER_URL = 'http://127.0.0.1:8000' }
$args = "run dev -- -p $FrontendPort -H $BindHost"
$nextProc = Start-Process -FilePath 'npm' -ArgumentList $args -WorkingDirectory $webDir -PassThru -WindowStyle Minimized

Write-Host ""
Write-Host ("Frontend:  http://localhost:{0}  (PID {1})" -f $FrontendPort, $nextProc.Id)
if ($railsProc) { Write-Host ("Backend:   {0} (PID {1})" -f $backendUrl, $railsProc.Id) }

try { Start-Process ("http://localhost:{0}" -f $FrontendPort) } catch {}

Write-Host "Use scripts/stop-dev.ps1 to stop both ports."
