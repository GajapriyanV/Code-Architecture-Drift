# Drift Detector Setup Guide

This guide will help you set up and run both the Rails backend and Next.js frontend servers.

## Prerequisites

- Ruby 3.2.0 or later
- PostgreSQL
- Node.js 18 or later
- npm or yarn

## Database Setup

1. **Start PostgreSQL** service
2. **Navigate to Rails directory:**
   ```bash
   cd drift-rails
   ```
3. **Install Ruby dependencies:**
   ```bash
   bundle install
   ```
4. **Create and setup database:**
   ```bash
   rails db:create
   rails db:migrate
   rails db:seed
   ```

## Starting the Servers

### Option 1: Use the Batch File (Windows)
Simply double-click `start-servers.bat` in the root directory.

### Option 2: Manual Setup

#### Start Rails Backend (Port 3001)
```bash
cd drift-rails
rails server -p 3001
```

#### Start Next.js Frontend (Port 3000)
In a new terminal:
```bash
cd drift-web
npm run dev
```

## Server URLs

- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:3001/graphql
- **Health Check**: http://localhost:3001/health

## Testing the Connection

1. Open http://localhost:3000 in your browser
2. Navigate to the Projects page
3. You should see sample projects loaded from the Rails backend
4. Click on a project to view details and violations

## Sample Data

The database is seeded with:
- 3 sample projects
- Sample scans with drift scores
- Sample architecture violations

## Troubleshooting

### Frontend can't connect to backend
- Ensure Rails server is running on port 3001
- Check CORS configuration in Rails
- Verify GraphQL endpoint is accessible

### Database connection issues
- Ensure PostgreSQL is running
- Check database.yml configuration
- Run `rails db:create db:migrate db:seed`

### Port conflicts
- Frontend uses port 3000
- Backend uses port 3001
- Adjust ports in configuration files if needed

## Architecture

- **Frontend**: Next.js with Apollo Client for GraphQL
- **Backend**: Rails with GraphQL API
- **Database**: PostgreSQL
- **Communication**: GraphQL over HTTP
- **CORS**: Configured to allow frontend-backend communication
