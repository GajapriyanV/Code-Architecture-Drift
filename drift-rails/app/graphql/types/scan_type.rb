class Types::ScanType < Types::BaseObject
  field :id, ID, null: false
  field :git_sha, String, null: false
  field :mode, String, null: false
  field :drift_score, Float, null: false
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  
  field :project, Types::ProjectType, null: false
  field :graph_nodes, [Types::GraphNodeType], null: false
  field :graph_edges, [Types::GraphEdgeType], null: false
  field :violations, [Types::ViolationType], null: false
  field :metrics, Types::ScanMetricsType, null: false
  
  def metrics
    object.metrics
  end
end
