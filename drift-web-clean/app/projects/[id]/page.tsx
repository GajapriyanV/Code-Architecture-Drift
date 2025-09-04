'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, gql } from '@apollo/client'
import { demoMode } from '../../lib/config'
import { demoProject } from '../../lib/demoData'

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      repoUrl
      defaultBranch
      latestScan {
        id
        gitSha
        driftScore
        metrics {
          driftScore
          counts {
            nodes
            edges
            violations
          }
        }
        violations {
          id
          ruleCode
          severity
          details
          suggestion
          nodePath
        }
      }
    }
  }
`

interface Violation {
  id: string
  ruleCode: string
  severity: string
  details: string
  suggestion: string
  nodePath: string
}

interface ScanMetrics {
  driftScore: number
  counts: {
    nodes: number
    edges: number
    violations: number
  }
}

interface Project {
  id: string
  name: string
  repoUrl: string
  defaultBranch: string
  latestScan?: {
    id: string
    gitSha: string
    driftScore: number
    metrics: ScanMetrics
    violations: Violation[]
  }
}

export default function ProjectPage() {
  const params = useParams() as { id?: string }
  const apollo = useQuery(GET_PROJECT, {
    variables: { id: params.id },
    skip: demoMode || !params.id
  })
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    if (demoMode && params.id) {
      setProject(demoProject(params.id) as unknown as Project)
    } else if (apollo.data?.project) {
      setProject(apollo.data.project)
    }
  }, [apollo.data, params?.id])

  if (!demoMode && apollo.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-zinc-300">Loading...</div>
      </div>
    )
  }

  if ((!demoMode && apollo.error) || !project) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 text-lg mb-4">
          {apollo.error ? `Error loading project: ${apollo.error.message}` : 'Project not found'}
        </div>
        <a href="/" className="text-cyan-300 hover:text-white underline">
          Back to home
        </a>
      </div>
    )
  }

  const { latestScan } = project
  const driftScore = latestScan?.metrics.driftScore || 0
  const violations = latestScan?.violations || []

  return (
    <div className="">
      <div className="">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">{project.name}</h1>
          <p className="text-sm font-mono text-zinc-400">{project.repoUrl}</p>
          <p className="text-xs text-zinc-500">Branch: {project.defaultBranch}</p>
        </div>

        {/* Drift Score */}
        <div className="card p-6 mb-8">
          <h2 className="section-title mb-4">Architecture Drift Score</h2>
          <div className="flex items-center space-x-4">
            <div className={`text-6xl font-bold ${
              driftScore === 0 ? 'text-green-400' :
              driftScore < 0.3 ? 'text-yellow-400' :
              driftScore < 0.7 ? 'text-orange-400' : 'text-red-400'
            }`}>
              {(driftScore * 100).toFixed(0)}%
            </div>
            <div className="flex-1">
              <div className="w-full bg-white/10 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${
                    driftScore === 0 ? 'bg-green-500' :
                    driftScore < 0.3 ? 'bg-yellow-400' :
                    driftScore < 0.7 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${driftScore * 100}%` }}
                ></div>
              </div>
              <p className="text-sm muted mt-2">
                {driftScore === 0 ? 'No violations detected' :
                 driftScore < 0.3 ? 'Low drift - minor issues' :
                 driftScore < 0.7 ? 'Medium drift - review needed' : 'High drift - immediate attention required'}
              </p>
            </div>
          </div>
          
          {latestScan && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{latestScan.metrics.counts.nodes}</div>
                <div className="text-sm text-zinc-400">Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{latestScan.metrics.counts.edges}</div>
                <div className="text-sm text-zinc-400">Dependencies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{latestScan.metrics.counts.violations}</div>
                <div className="text-sm text-zinc-400">Violations</div>
              </div>
            </div>
          )}
        </div>

        {/* Violations Table */}
        {violations.length > 0 && (
          <div className="card">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Architecture Violations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Suggestion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {violations.map((violation) => (
                    <tr key={violation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge bg-red-500/10 text-red-300 border-red-400/30">
                          {violation.ruleCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          violation.severity === 'high' ? 'bg-red-500/10 text-red-300 border-red-400/30' :
                          violation.severity === 'medium' ? 'bg-yellow-400/10 text-yellow-300 border-yellow-300/30' :
                          'bg-blue-400/10 text-blue-300 border-blue-300/30'
                        }`}>
                          {violation.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-200">
                        {violation.nodePath}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-200">
                        {violation.details}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {violation.suggestion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Violations Message */}
        {violations.length === 0 && latestScan && (
          <div className="border border-green-400/30 bg-green-500/10 rounded-lg p-6 text-center">
            <div className="text-green-300">
              <div className="text-lg font-medium mb-2">✅ No Violations Found!</div>
              <div className="text-sm text-green-200/80">Your codebase is following the defined architecture rules.</div>
            </div>
          </div>
        )}

        {/* Graph View Placeholder */}
        <div className="card p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Dependency Graph</h2>
          <div className="bg-black/60 border border-white/10 rounded-lg p-8 text-center">
            <div className="text-zinc-400">
              <div className="text-lg mb-2">Graph visualization coming in Week 2</div>
              <div className="text-sm">This will show the dependency graph with violations highlighted in red</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
