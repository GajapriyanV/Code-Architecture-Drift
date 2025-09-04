'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'
import { demoMode } from '../lib/config'
import { demoProjects } from '../lib/demoData'

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
  const apollo = useQuery(GET_PROJECTS, { skip: demoMode })
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (demoMode) {
      setProjects(demoProjects() as unknown as Project[])
    } else if (apollo.data?.projects) {
      setProjects(apollo.data.projects)
    }
  }, [apollo.data])

  if (!demoMode && apollo.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-zinc-300">Loading projects...</div>
      </div>
    )
  }

  if (!demoMode && apollo.error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-lg">
          Error loading projects: {apollo.error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="muted">Monitor architecture drift across your repositories</p>
        </div>

        {projects.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-zinc-400">
              <div className="text-lg mb-2">No projects found</div>
              <div className="text-sm">Projects will appear here once they are added to the system</div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="card hover:shadow-md transition-all">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-1">{project.name}</h2>
                  <p className="text-xs text-zinc-400 mb-4 font-mono">{project.repoUrl}</p>
                  
                  {project.latestScan ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-300">Drift Score</span>
                        <span className={`text-lg font-bold ${
                          project.latestScan.metrics.driftScore === 0 ? 'text-green-400' :
                          project.latestScan.metrics.driftScore < 0.3 ? 'text-yellow-400' :
                          project.latestScan.metrics.driftScore < 0.7 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {(project.latestScan.metrics.driftScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            project.latestScan.metrics.driftScore === 0 ? 'bg-green-500' :
                            project.latestScan.metrics.driftScore < 0.3 ? 'bg-yellow-400' :
                            project.latestScan.metrics.driftScore < 0.7 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${project.latestScan.metrics.driftScore * 100}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-xs text-zinc-400">
                        <div>
                          <div className="font-semibold text-white">{project.latestScan.metrics.counts.nodes}</div>
                          <div>Files</div>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{project.latestScan.metrics.counts.edges}</div>
                          <div>Deps</div>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{project.latestScan.metrics.counts.violations}</div>
                          <div>Issues</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-zinc-400 text-sm">No scans yet</div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Link
                      href={`/projects/${project.id}`}
                      className="btn-primary w-full text-center"
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
          <button className="btn-primary px-6 py-3">+ Add New Project</button>
          <p className="text-sm muted mt-2">Configure a new repository to monitor for architecture drift</p>
        </div>
      </div>
    </div>
  )
}
