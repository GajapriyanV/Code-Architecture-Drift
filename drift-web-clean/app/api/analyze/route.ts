import { NextRequest } from 'next/server'

const ANALYZER_URL = process.env.ANALYZER_URL || process.env.FASTAPI_URL || 'http://127.0.0.1:8000'

export async function POST(req: NextRequest) {
  const bodyText = await req.text()

  try {
    const res = await fetch(`${ANALYZER_URL.replace(/\/$/, '')}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText,
    })

    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    // Fallback demo payload so the UI works even without a running analyzer
    const fallback = {
      metrics: { drift_score: 0.25 },
      nodes: [
        { id: 'controllers/users_controller.rb', label: 'users_controller.rb', layer: 'controllers' },
        { id: 'repositories/user_repository.rb', label: 'user_repository.rb', layer: 'repositories' },
        { id: 'services/user_service.rb', label: 'user_service.rb', layer: 'services' },
      ],
      edges: [
        { from: 'controllers/users_controller.rb', to: 'services/user_service.rb', edge_type: 'call' },
        { from: 'services/user_service.rb', to: 'repositories/user_repository.rb', edge_type: 'call' },
        // Violation example
        { from: 'controllers/users_controller.rb', to: 'repositories/user_repository.rb', edge_type: 'call' },
      ],
      violations: [
        { ruleCode: 'FORBIDDEN_DEP', details: 'controllers/users_controller.rb → repositories/user_repository.rb' },
      ],
      _warning: 'Analyzer not reachable; returned demo data',
    }
    return Response.json(fallback, { status: 200 })
  }
}

