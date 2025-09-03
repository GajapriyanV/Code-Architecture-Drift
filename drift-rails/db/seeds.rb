# Create sample projects
project1 = Project.create!(
  name: "Sample Rails App",
  repo_url: "https://github.com/example/sample-rails-app",
  default_branch: "main",
  github_installation_id: 12345
)

project2 = Project.create!(
  name: "E-commerce Platform",
  repo_url: "https://github.com/example/ecommerce-platform",
  default_branch: "main",
  github_installation_id: 12346
)

project3 = Project.create!(
  name: "API Gateway",
  repo_url: "https://github.com/example/api-gateway",
  default_branch: "main",
  github_installation_id: 12347
)

# Create sample scans for project1
scan1 = project1.scans.create!(
  git_sha: "abc123def456",
  mode: "full",
  drift_score: 0.25
)

# Create scan metrics for scan1
scan1.create_scan_metrics!(
  drift_score: 0.25,
  scan_counts_attributes: {
    nodes: 45,
    edges: 67,
    violations: 17
  }
)

# Create sample violations for scan1
scan1.violations.create!([
  {
    node_path: "app/controllers/users_controller.rb",
    rule_code: "FORBIDDEN_DEP",
    severity: "high",
    details: "Direct dependency from controllers to repositories: app/controllers/users_controller.rb → app/repositories/user_repository.rb",
    suggestion: "Route via allowed layer (see must_route_via rules)."
  },
  {
    node_path: "app/controllers/users_controller.rb",
    rule_code: "DISALLOWED_API",
    severity: "medium",
    details: "Pattern `\\.where\\(` matched in app/controllers/users_controller.rb",
    suggestion: "Move database access to appropriate service/repository layer."
  }
])

# Create sample scan for project2
scan2 = project2.scans.create!(
  git_sha: "def456ghi789",
  mode: "full",
  drift_score: 0.08
)

scan2.create_scan_metrics!(
  drift_score: 0.08,
  scan_counts_attributes: {
    nodes: 120,
    edges: 89,
    violations: 7
  }
)

# Create sample scan for project3 (no violations)
scan3 = project3.scans.create!(
  git_sha: "ghi789jkl012",
  mode: "full",
  drift_score: 0.0
)

scan3.create_scan_metrics!(
  drift_score: 0.0,
  scan_counts_attributes: {
    nodes: 23,
    edges: 34,
    violations: 0
  }
)

puts "Sample data created successfully!"
puts "Projects: #{Project.count}"
puts "Scans: #{Scan.count}"
puts "Violations: #{Violation.count}"
