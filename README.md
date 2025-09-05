# AI Architecture Drift Detector

A full-stack AI tool that prevents architecture drift by comparing your intended design (docs/diagrams) to the actual codebase.

## 🏗️ Architecture

- **Manager/API**: Ruby on Rails + GraphQL + Sidekiq
- **Analyzer (static)**: Python + FastAPI + tree-sitter (Ruby + TypeScript)
- **Frontend**: Next.js + TypeScript + Cytoscape.js (graph viz)
- **AI (assistive)**: OpenAI API — convert docs → rules; write violation explanations

## 📁 Project Structure

```
drift-detector/
├── drift-rails/      # Rails API, GraphQL, Sidekiq, GitHub webhooks
├── drift-analyzer/   # FastAPI service for static analysis
├── drift-web/        # Next.js app (TS) for the UI
├── drift-proto/      # Shared architecture schema, sample prompts
├── docker-compose.yml # Development services (PostgreSQL, Redis)
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Ruby 3.2+** with Rails 7+
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Docker & Docker Compose** (for services)
- **Git**

### 1. Start Development Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps
```

### 2. Setup Rails API

```bash
cd drift-rails

# Install dependencies
bundle install

# Setup database
rails db:create db:migrate

# Start Rails server (in one terminal)
rails server

# Start Sidekiq (in another terminal)
bundle exec sidekiq
```

### 3. Setup Python Analyzer

```bash
cd drift-analyzer

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (in one terminal)
uvicorn main:app --reload --port 8000
```

### 4. Setup Next.js Frontend

```bash
cd drift-web

# Install dependencies
npm install

# Start development server (in one terminal)
npm run dev
```

### 5. Environment Configuration

Create `.env` files in each service directory:

**drift-rails/.env**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/drift_rails_development
REDIS_URL=redis://localhost:6379
ANALYZER_URL=http://localhost:8000
GITHUB_TOKEN=your_github_pat_here
SECRET_KEY_BASE=your_secret_key_base_here
```

**drift-web/.env.local**
```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
```

## 🔧 How It Works

1. **Push to GitHub repo** → Rails receives webhook
2. **Rails enqueues `ScanRepoJob`** → Background job processing
3. **Rails calls Python analyzer** → `/analyze` endpoint with repo ref + architecture.yml
4. **Analyzer clones & parses** → Builds dependency graph, applies rules
5. **Rails persists results** → Violations + drift score stored in database
6. **GraphQL serves data** → Frontend queries for real-time updates
7. **Frontend displays** → Drift score, violations table, dependency graph

## 📋 Architecture Rules (architecture.yml)

```yaml
layers:
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
  - { layer: controllers, patterns: ["ActiveRecord::Base", "\\.where\\(", "\\.find\\("] }
```

## 🧪 Testing the System

### 1. Create a Test Project

```bash
# Via Rails console
rails console

# Create a project
project = Project.create!(
  name: "Test Rails App",
  repo_url: "https://github.com/yourusername/test-rails-app",
  default_branch: "main",
  rules_jsonb: YAML.load_file("sample_architecture.yml")
)
```

### 2. Trigger a Scan

```bash
# Via Rails console
ScanRepoJob.perform_now(project_id: 1, ref: "main")

# Or via webhook (simulate GitHub push)
curl -X POST http://localhost:3000/webhooks/github \
  -H "Content-Type: application/json" \
  -d '{
    "repository": {"clone_url": "https://github.com/yourusername/test-rails-app"},
    "after": "main"
  }'
```

### 3. View Results

- **Frontend**: http://localhost:3001/projects/1
- **GraphQL**: http://localhost:3000/graphql
- **Sidekiq**: http://localhost:3000/sidekiq (dev only)

## 🎯 Development Roadmap

### ✅ Week 1 (Current)
- [x] Project setup and structure
- [x] Rails models + GraphQL + webhook + job + analyzer client
- [x] Analyzer: imports (TS), db_call (Ruby), rules engine
- [x] Persist results, show drift + violations table
- [x] Basic Next.js frontend with mock data

### 🔄 Week 2 (Next)
- [ ] PR status check + PR comment
- [ ] Cytoscape graph visualization
- [ ] AI: explanations + doc→rules from Markdown/Mermaid
- [ ] Polish: filters, trendline, timeouts, tempdir cleanup

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **Redis connection failed**
   ```bash
   # Check if Redis is running
   docker-compose ps redis
   
   # Test connection
   redis-cli ping
   ```

3. **Analyzer service unavailable**
   ```bash
   # Check if analyzer is running
   curl http://localhost:8000/health
   
   # Check logs
   cd drift-analyzer && tail -f logs/app.log
   ```

4. **Rails server won't start**
   ```bash
   # Check dependencies
   bundle install
   
   # Check database
   rails db:migrate:status
   
   # Check logs
   tail -f log/development.log
   ```

### Debug Mode

```bash
# Rails with debug logging
RAILS_LOG_LEVEL=debug rails server

# Sidekiq with verbose logging
bundle exec sidekiq -v

# Analyzer with debug logging
LOG_LEVEL=debug uvicorn main:app --reload --port 8000
```

## 📚 API Reference

### GraphQL Endpoints

- **POST** `/graphql` - Main GraphQL endpoint
- **GET** `/health` - Health check
- **POST** `/webhooks/github` - GitHub webhook receiver

### Analyzer Endpoints

- **POST** `/analyze` - Analyze repository for drift
- **GET** `/health` - Health check
- **GET** `/` - API info

### Frontend Routes

- `/` - Home page with overview
- `/api/status` - Frontend health JSON
- `/api/analyze` - Proxy to analyzer (FastAPI)
- `/simple` - Minimal test page
- `/hello.html` - Static file served by Next.js

## Unified Dev Workflow (Analyzer + Frontend)

For a streamlined local setup without Rails/GraphQL, you can now run the FastAPI analyzer and the Next.js frontend together.

Quick start (PowerShell on Windows)

1) Start both services

```
powershell -ExecutionPolicy Bypass -File scripts/dev-app.ps1
```

This will:

- Start FastAPI analyzer on `http://127.0.0.1:8000` (installs Python deps if needed)
- Start Next.js frontend on `http://localhost:3002` and set `ANALYZER_URL` for the proxy
- Open the browser

Options:

- `-FrontendPort 3002` — change frontend port
- `-AnalyzerPort 8000` — change analyzer port
- `-BindHost '::'` — bind frontend to IPv6 so `localhost` works reliably; use `'127.0.0.1'` for IPv4 only
- `-Setup:$false` — skip package installs

2) Stop both services

```
powershell -ExecutionPolicy Bypass -File scripts/stop-app.ps1
```

Analyzer proxy contract

- Frontend posts to `/api/analyze`, which forwards to `${ANALYZER_URL}/analyze`.
- Example payload the UI sends:

```
{
  "git": { "repo_url": "https://github.com/you/sample-rails.git", "ref": "main" },
  "rules": {},
  "rules_yaml": "layers:\n  - name: controllers\n    patterns: ['app/controllers/**/*.rb']\n...",
  "mode": "full"
}
```

- Expected response (subset):

```
{
  "metrics": { "drift_score": 0.25 },
  "nodes": [ { "id": "controllers/users_controller.rb", "label": "users_controller.rb", "layer": "controllers" } ],
  "edges": [ { "from": "controllers/users_controller.rb", "to": "repositories/user_repository.rb", "edge_type": "call" } ],
  "violations": [ { "ruleCode": "FORBIDDEN_DEP", "details": "controllers/users_controller.rb → repositories/user_repository.rb" } ]
}
```

Notes

- If the analyzer isn’t reachable, `/api/analyze` returns a small demo payload so the UI stays functional.
- The graph renderer highlights violation edges in red and is resilient to updates/unmounts.
- `/projects` - List all projects
- `/projects/[id]` - Project detail with drift analysis

## 🤝 Contributing

This is an MVP project. Contributions welcome!

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- **Ruby**: Follow Ruby style guide
- **Python**: Follow PEP 8
- **TypeScript**: Use strict mode, prefer interfaces over types
- **CSS**: Use Tailwind CSS utility classes

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create GitHub issues for bugs/features
- **Discussions**: Use GitHub discussions for questions
- **Wiki**: Check project wiki for detailed documentation

---

**Status**: 🚧 MVP Development (Week 1 Complete)
**Next Milestone**: Graph visualization and AI integration (Week 2)
