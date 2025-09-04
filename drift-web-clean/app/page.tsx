import Link from 'next/link'

export default function Home() {
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
            <Link href="/projects/new" className="btn-primary">Create Project</Link>
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
                <li>Push to GitHub repo → Rails receives webhook</li>
                <li>Rails enqueues ScanRepoJob</li>
                <li>Rails calls Python analyzer with repo ref + architecture.yml</li>
                <li>Analyzer clones, parses, builds dependency graph, applies rules</li>
                <li>Rails persists violations + drift score; GraphQL serves them</li>
                <li>Frontend shows: Drift score, Violations table, Graph view</li>
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
      </div>
    </div>
  )
}

