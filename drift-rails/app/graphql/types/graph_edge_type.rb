class Types::GraphEdgeType < Types::BaseObject
  field :id, ID, null: false
  field :from_path, String, null: false
  field :to_path, String, null: false
  field :edge_type, String, null: false
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  
  field :scan, Types::ScanType, null: false
end
