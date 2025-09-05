# Release Notes

## get server working and hooked up to frontend

Date: 2025-09-05

Highlights

- Unified dev script to start FastAPI analyzer and Next.js together (`scripts/dev-app.ps1`) with matching stop script.
- Frontend Analyze flow on the homepage: repo URL, ref/branch, rules YAML → POST `/api/analyze` → renders drift score, violations, and graph.
- Next.js proxy route `/api/analyze` forwards to `ANALYZER_URL/analyze` with a demo fallback to keep the UI usable when the analyzer is offline.
- Cytoscape graph component with stable instance management and robust arrow parsing (supports `→` and `->`).
- `scripts/dev.ps1` updates: host binding and `ANALYZER_URL` default for reliability on Windows `localhost`.

Run

- Start both: `powershell -ExecutionPolicy Bypass -File scripts/dev-app.ps1`
- Stop both: `powershell -ExecutionPolicy Bypass -File scripts/stop-app.ps1`
- Frontend: `http://localhost:3002`
- Analyzer health: `http://127.0.0.1:8000/health`

Notes

- If you see a blank page on `localhost`, use `-BindHost '::'` to bind IPv6 or `-BindHost '127.0.0.1'` for IPv4.
- Demo mode still exists for frontend-only runs (`scripts/dev.ps1 -SkipBackend`), but the preferred path is the unified script above.

