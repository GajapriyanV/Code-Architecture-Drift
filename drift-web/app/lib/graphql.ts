import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create the Apollo Client
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql', // Rails GraphQL endpoint
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
