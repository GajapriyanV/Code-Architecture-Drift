"use client"
import { useState } from 'react'
import Link from 'next/link'
import GraphView from './components/GraphView'

type AnalyzeResponse = {
  metrics?: { drift_score?: number }
  nodes?: any[]
  edges?: any[]
  violations?: { ruleCode?: string; details?: string }[]
  _warning?: string
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/example/sample-rails-app.git')
  const [ref, setRef] = useState('main')
  const [rules, setRules] = useState(`layers:\n  - name: controllers\n    patterns: ["app/controllers/**/*.rb"]\n  - name: services\n    patterns: ["app/services/**/*.rb"]\n  - name: repositories\n    patterns: ["app/repositories/**/*.rb"]\n\nforbidden_dependencies:\n  - { from: controllers, to: repositories }`)
  const [res, setRes] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onAnalyze = async () => {
    setLoading(true)
    setError(null)
    setRes(null)
    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          git: { repo_url: repoUrl, ref },
          rules: {},
          rules_yaml: rules,
          mode: 'full',
        }),
      })
      if (!resp.ok) throw new Error(`Analyze failed (${resp.status})`)
      const data = (await resp.json()) as AnalyzeResponse
      setRes(data)
    } catch (e: any) {
      setError(e.message || 'Failed to analyze')
    } finally {
      setLoading(false)
    }
  }

  const score = res?.metrics?.drift_score ?? null
  const scoreColor = score === null ? 'text-zinc-400' : score === 0 ? 'text-green-400' : score < 0.3 ? 'text-yellow-400' : score < 0.7 ? 'text-orange-400' : 'text-red-400'

  return (
    <div className="px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            <span className="size-1.5 rounded-full bg-cyan-400" />
            Architecture guardrails for fast-moving teams
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight text-white">
            AI Architecture <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">Drift Detector</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto">
            Prevent architecture drift by continuously comparing your intended design to the code that ships.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="#analyze" className="btn-primary">Analyze</Link>
            <Link href="/projects" className="btn-secondary">Browse Projects</Link>
          </div>
        </section>

        {/* Features */}
        <section className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            { title: 'Graph-Powered Insights', desc: 'Builds a dependency graph to reveal risky couplings and bottlenecks.', icon: '🕸️' },
            { title: 'Policy as Code', desc: 'Enforce layered boundaries, route rules, and banned APIs.', icon: '⚖️' },
            { title: 'Actionable Reports', desc: 'See a drift score and violations with clear remediation paths.', icon: '📈' },
          ].map((f) => (
            <div key={f.title} className="card">
              <div className="card-body">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-zinc-400 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* How it works + Example */}
        <section className="mt-14 grid lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-body">
              <h2 className="section-title mb-4">How It Works</h2>
              <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                <li>Push to GitHub repo → Analyzer receives request</li>
                <li>Analyzer clones repo at ref and parses dependencies</li>
                <li>Rules are applied to graph to detect violations</li>
                <li>Results returned: drift score, violations, and graph</li>
                <li>Frontend renders score, table, and interactive graph</li>
              </ol>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 className="section-title mb-4">Architecture Rules Example</h2>
              <pre className="bg-black/60 border border-white/10 p-4 rounded-lg overflow-x-auto text-sm text-zinc-200">
{`layers:
  - name: controllers
    patterns: ["app/controllers/**/*.rb"]
  - name: services
    patterns: ["app/services/**/*.rb"]
  - name: repositories
    patterns: ["app/repositories/**/*.rb"]

forbidden_dependencies:
  - { from: controllers, to: repositories }

must_route_via:
  - { from: controllers, to: repositories, via: services }

disallowed_apis:
  - { layer: controllers, patterns: ["ActiveRecord::Base", "\\.where\\(", "\\.find\\("] }`}
              </pre>
            </div>
          </div>
        </section>

        {/* Analyze section */}
        <h2 id="analyze" className="section-title mt-16">Analyze Repository</h2>
        <p className="text-zinc-400 mt-2">Analyze a repo + ref against your architecture rules.</p>

        {/* Analyze form */}
        <div className="card mt-6">
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Repo URL</label>
              <input className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" value={repoUrl} onChange={e=>setRepoUrl(e.target.value)} placeholder="https://github.com/you/repo.git" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm text-zinc-300 mb-1">Ref/branch</label>
                <input className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white" value={ref} onChange={e=>setRef(e.target.value)} placeholder="main or git SHA" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-300 mb-1">Rules YAML</label>
                <textarea className="w-full h-32 rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white font-mono" value={rules} onChange={e=>setRules(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onAnalyze} disabled={loading} className="btn-primary">{loading ? 'Analyzing...' : 'Analyze'}</button>
              {error && <span className="text-red-400 text-sm">{error}</span>}
              {res?._warning && <span className="text-yellow-300/80 text-xs">{res._warning}</span>}
            </div>
          </div>
        </div>

        {/* Results */}
        {res && (
          <div className="mt-10 space-y-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center gap-6">
                  <div className={`text-6xl font-bold ${scoreColor}`}>{score !== null ? `${Math.round(score*100)}%` : '--'}</div>
                  <div className="text-zinc-400">Drift Score</div>
                </div>
              </div>
            </div>

            {res.violations && (
              <div className="card">
                <div className="px-6 py-4 border-b border-white/10"><h2 className="text-white font-semibold">Violations</h2></div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Rule</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-zinc-400 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {res.violations.map((v, i) => (
                        <tr key={i}>
                          <td className="px-6 py-3 text-zinc-200 text-sm">{v.ruleCode}</td>
                          <td className="px-6 py-3 text-zinc-300 text-sm font-mono">{v.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(res.nodes && res.edges) && (
              <div className="card">
                <div className="px-6 py-4 border-b border-white/10"><h2 className="text-white font-semibold">Graph</h2></div>
                <div className="card-body">
                  <GraphView nodes={res.nodes || []} edges={res.edges || []} violations={res.violations || []} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

