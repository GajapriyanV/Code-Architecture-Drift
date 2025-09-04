export async function GET() {
  return Response.json({ ok: true, mode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'demo' : 'normal' })
}

