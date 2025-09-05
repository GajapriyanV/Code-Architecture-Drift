Param(
  [int]$FrontendPort = 3002,
  [int]$AnalyzerPort = 8000
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
    } else {
      Write-Host "No listeners on port $Port"
    }
  } catch {}
}

Stop-Port -Port $FrontendPort
Stop-Port -Port $AnalyzerPort

Write-Host "Done."

