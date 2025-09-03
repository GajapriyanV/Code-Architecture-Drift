class Types::ViolationType < Types::BaseObject
  field :id, ID, null: false
  field :node_path, String, null: false
  field :rule_code, String, null: false
  field :severity, String, null: false
  field :details, String, null: false
  field :suggestion, String, null: true
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  
  field :scan, Types::ScanType, null: false
end
