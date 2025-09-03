class DriftRailsSchema < GraphQL::Schema
  mutation(Types::MutationType)
  query(Types::QueryType)

  # Opt in to the new runtime (default in future GraphQL-Ruby versions)
  use GraphQL::Dataloader

  # Add built-in connections for pagination
  use GraphQL::Pagination::Connections

  # Add built-in connections for pagination
  use GraphQL::Pagination::Connections
end
