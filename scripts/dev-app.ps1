Param(
  [int]$FrontendPort = 3002,
  [int]$AnalyzerPort = 8000,
  [string]$BindHost = '::',
  [switch]$Setup = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Stop-Port {
  Param([int]$Port)
  try {
    $pids = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique
    if ($pids) {
      Write-Host ("Stopping processes on port {0}: {1}" -f $Port, ($pids -join ', '))
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

Write-Host ("Cleaning ports {0} and {1}..." -f $FrontendPort, $AnalyzerPort)
Stop-Port -Port $FrontendPort
Stop-Port -Port $AnalyzerPort

# Start FastAPI analyzer
$anDir = Resolve-Path 'drift-analyzer'
Write-Host ("Starting Analyzer (FastAPI) in {0} on {1}..." -f $anDir, $AnalyzerPort)
if ($Setup) {
  try {
    Write-Host "Ensuring Python deps (pip install -r requirements.txt) ..."
    Start-Process -FilePath 'python' -ArgumentList '-m pip install -r requirements.txt' -WorkingDirectory $anDir -Wait -NoNewWindow | Out-Null
  } catch { Write-Warning ("pip install failed: {0}" -f $_) }
}
$anProc = Start-Process -FilePath 'python' -ArgumentList ("-m uvicorn main:app --host 127.0.0.1 --port {0} --reload" -f $AnalyzerPort) -WorkingDirectory $anDir -PassThru -WindowStyle Minimized
$anUrl = ("http://127.0.0.1:{0}" -f $AnalyzerPort)
if (Wait-Health -Url ($anUrl + '/health')) {
  Write-Host ("Analyzer healthy at {0}" -f $anUrl)
} else {
  Write-Warning ("Analyzer health check timed out at {0}/health - continuing" -f $anUrl)
}

# Start Next.js frontend
$webDir = Resolve-Path 'drift-web-clean'
Write-Host ("Starting Next.js in {0} on {1}..." -f $webDir, $FrontendPort)
$env:ANALYZER_URL = $anUrl
$env:NEXT_PUBLIC_DEMO_MODE = 'false'
if ($Setup -and -not (Test-Path (Join-Path $webDir 'node_modules'))) {
  try {
    Write-Host "Installing frontend dependencies (npm install) ..."
    Start-Process -FilePath 'npm' -ArgumentList 'install' -WorkingDirectory $webDir -Wait -NoNewWindow | Out-Null
  } catch { Write-Warning ("npm install failed: {0}" -f $_) }
}
$nextProc = Start-Process -FilePath 'npm' -ArgumentList ("run dev -- -p {0} -H {1}" -f $FrontendPort, $BindHost) -WorkingDirectory $webDir -PassThru -WindowStyle Minimized

Write-Host ""
Write-Host ("Frontend:  http://localhost:{0}  (PID {1})" -f $FrontendPort, $nextProc.Id)
Write-Host ("Analyzer:  {0} (PID {1})" -f $anUrl, $anProc.Id)

try { Start-Process ("http://localhost:{0}" -f $FrontendPort) } catch {}

Write-Host "Use scripts/stop-app.ps1 to stop both ports."

