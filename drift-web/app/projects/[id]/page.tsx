'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, gql } from '@apollo/client'

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
  const params = useParams()
  const { loading, error, data } = useQuery(GET_PROJECT, {
    variables: { id: params.id },
    skip: !params.id
  })
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    if (data?.project) {
      setProject(data.project)
    }
  }, [data])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg mb-4">
          {error ? `Error loading project: ${error.message}` : 'Project not found'}
        </div>
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">
          Back to home
        </a>
      </div>
    )
  }

  const { latestScan } = project
  const driftScore = latestScan?.metrics.driftScore || 0
  const violations = latestScan?.violations || []

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
          <p className="text-gray-600">{project.repoUrl}</p>
          <p className="text-sm text-gray-500">Branch: {project.defaultBranch}</p>
        </div>

        {/* Drift Score */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Architecture Drift Score</h2>
          <div className="flex items-center space-x-4">
            <div className={`text-6xl font-bold ${
              driftScore === 0 ? 'text-green-600' :
              driftScore < 0.3 ? 'text-yellow-600' :
              driftScore < 0.7 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {(driftScore * 100).toFixed(0)}%
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${
                    driftScore === 0 ? 'bg-green-600' :
                    driftScore < 0.3 ? 'bg-yellow-600' :
                    driftScore < 0.7 ? 'bg-orange-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${driftScore * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {driftScore === 0 ? 'No violations detected' :
                 driftScore < 0.3 ? 'Low drift - minor issues' :
                 driftScore < 0.7 ? 'Medium drift - review needed' : 'High drift - immediate attention required'}
              </p>
            </div>
          </div>
          
          {latestScan && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{latestScan.metrics.counts.nodes}</div>
                <div className="text-sm text-gray-600">Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{latestScan.metrics.counts.edges}</div>
                <div className="text-sm text-gray-600">Dependencies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{latestScan.metrics.counts.violations}</div>
                <div className="text-sm text-gray-600">Violations</div>
              </div>
            </div>
          )}
        </div>

        {/* Violations Table */}
        {violations.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Architecture Violations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suggestion
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {violations.map((violation) => (
                    <tr key={violation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {violation.ruleCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          violation.severity === 'high' ? 'bg-red-100 text-red-800' :
                          violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {violation.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {violation.nodePath}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {violation.details}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-800">
              <div className="text-lg font-medium mb-2">🎉 No Violations Found!</div>
              <div className="text-sm">Your codebase is following the defined architecture rules.</div>
            </div>
          </div>
        )}

        {/* Graph View Placeholder */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dependency Graph</h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="text-gray-500">
              <div className="text-lg mb-2">Graph visualization coming in Week 2</div>
              <div className="text-sm">This will show the dependency graph with violations highlighted in red</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
