import Link from 'next/link'

export default function Home() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Architecture Drift Detector
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Prevent architecture drift by comparing your intended design to the actual codebase
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How It Works
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Push to GitHub repo → Rails receives webhook</li>
              <li>Rails enqueues ScanRepoJob</li>
              <li>Rails calls Python analyzer with repo ref + architecture.yml</li>
              <li>Analyzer clones, parses, builds dependency graph, applies rules</li>
              <li>Rails persists violations + drift score; GraphQL serves them</li>
              <li>Frontend shows: Drift score, Violations table, Graph view</li>
            </ol>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Quick Start
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">1. View Projects</h3>
                <Link 
                  href="/projects" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Browse all projects
                </Link>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">2. Sample Project</h3>
                <Link 
                  href="/projects/1" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View sample project
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Architecture Rules Example
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
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
    </div>
  )
}
