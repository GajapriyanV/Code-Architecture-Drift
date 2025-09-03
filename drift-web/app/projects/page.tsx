'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
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
      }
    }
  }
`

interface Project {
  id: string
  name: string
  repoUrl: string
  defaultBranch: string
  latestScan?: {
    id: string
    gitSha: string
    driftScore: number
    metrics: {
      driftScore: number
      counts: {
        nodes: number
        edges: number
        violations: number
      }
    }
  }
}

export default function ProjectsPage() {
  const { loading, error, data } = useQuery(GET_PROJECTS)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (data?.projects) {
      setProjects(data.projects)
    }
  }, [data])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-lg">
          Error loading projects: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Monitor architecture drift across your repositories</p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500">
              <div className="text-lg mb-2">No projects found</div>
              <div className="text-sm">Projects will appear here once they are added to the system</div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h2>
                  <p className="text-sm text-gray-600 mb-4 font-mono">{project.repoUrl}</p>
                  
                  {project.latestScan ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Drift Score</span>
                        <span className={`text-lg font-bold ${
                          project.latestScan.metrics.driftScore === 0 ? 'text-green-600' :
                          project.latestScan.metrics.driftScore < 0.3 ? 'text-yellow-600' :
                          project.latestScan.metrics.driftScore < 0.7 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {(project.latestScan.metrics.driftScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            project.latestScan.metrics.driftScore === 0 ? 'bg-green-600' :
                            project.latestScan.metrics.driftScore < 0.3 ? 'bg-yellow-600' :
                            project.latestScan.metrics.driftScore < 0.7 ? 'bg-orange-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${project.latestScan.metrics.driftScore * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                        <div>
                          <div className="font-semibold">{project.latestScan.metrics.counts.nodes}</div>
                          <div>Files</div>
                        </div>
                        <div>
                          <div className="font-semibold">{project.latestScan.metrics.counts.edges}</div>
                          <div>Deps</div>
                        </div>
                        <div>
                          <div className="font-semibold">{project.latestScan.metrics.counts.violations}</div>
                          <div>Issues</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-500 text-sm">No scans yet</div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Link 
                      href={`/projects/${project.id}`}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Project Button */}
        <div className="mt-8 text-center">
          <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
            + Add New Project
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Configure a new repository to monitor for architecture drift
          </p>
        </div>
      </div>
    </div>
  )
}
