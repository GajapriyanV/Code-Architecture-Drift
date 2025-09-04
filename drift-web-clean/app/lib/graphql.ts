import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create the Apollo Client
// Use a local Next.js proxy to avoid CORS during development
// The proxy forwards to the Rails server (default http://localhost:3001)
const httpLink = createHttpLink({
  uri: '/api/graphql',
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// GraphQL Queries
export const GET_PROJECTS = `
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
`;

export const GET_PROJECT = `
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
`;

export const GET_SCAN = `
  query GetScan($id: ID!) {
    scan(id: $id) {
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
`;
