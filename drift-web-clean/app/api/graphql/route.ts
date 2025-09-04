import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const res = await fetch(`${BACKEND_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Pass through auth headers if present
      Authorization: req.headers.get('authorization') || '',
    },
    body,
  })

  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

