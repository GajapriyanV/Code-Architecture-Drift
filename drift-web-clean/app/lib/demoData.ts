// Lightweight demo data used when NEXT_PUBLIC_DEMO_MODE=true

export type DemoViolation = {
  id: string
  ruleCode: string
  severity: 'low' | 'medium' | 'high'
  details: string
  suggestion?: string
  nodePath: string
}

export type DemoScan = {
  id: string
  gitSha: string
  driftScore: number
  metrics: {
    driftScore: number
    counts: { nodes: number; edges: number; violations: number }
  }
  violations?: DemoViolation[]
}

export type DemoProject = {
  id: string
  name: string
  repoUrl: string
  defaultBranch: string
  latestScan?: DemoScan
}

const projects: DemoProject[] = [
  {
    id: '1',
    name: 'Sample Rails App',
    repoUrl: 'https://github.com/example/sample-rails-app',
    defaultBranch: 'main',
    latestScan: {
      id: 'scan-1',
      gitSha: 'abc123def456',
      driftScore: 0.25,
      metrics: { driftScore: 0.25, counts: { nodes: 45, edges: 67, violations: 17 } },
      violations: [
        {
          id: 'v1',
          nodePath: 'app/controllers/users_controller.rb',
          ruleCode: 'FORBIDDEN_DEP',
          severity: 'high',
          details:
            'Direct dependency from controllers to repositories: app/controllers/users_controller.rb -> app/repositories/user_repository.rb',
          suggestion: 'Route via allowed layer (see must_route_via rules).',
        },
        {
          id: 'v2',
          nodePath: 'app/controllers/users_controller.rb',
          ruleCode: 'DISALLOWED_API',
          severity: 'medium',
          details: 'Pattern \\.where\\( matched in app/controllers/users_controller.rb',
          suggestion: 'Move database access to appropriate service/repository layer.',
        },
      ],
    },
  },
  {
    id: '2',
    name: 'E-commerce Platform',
    repoUrl: 'https://github.com/example/ecommerce-platform',
    defaultBranch: 'main',
    latestScan: {
      id: 'scan-2',
      gitSha: 'def456ghi789',
      driftScore: 0.08,
      metrics: { driftScore: 0.08, counts: { nodes: 120, edges: 89, violations: 7 } },
    },
  },
  {
    id: '3',
    name: 'API Gateway',
    repoUrl: 'https://github.com/example/api-gateway',
    defaultBranch: 'main',
    latestScan: {
      id: 'scan-3',
      gitSha: 'ghi789jkl012',
      driftScore: 0.0,
      metrics: { driftScore: 0.0, counts: { nodes: 23, edges: 34, violations: 0 } },
      violations: [],
    },
  },
]

export function demoProjects(): DemoProject[] {
  return projects
}

export function demoProject(id: string): DemoProject | null {
  return projects.find((p) => p.id === String(id)) || null
}

