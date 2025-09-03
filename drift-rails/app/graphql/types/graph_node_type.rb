class Types::GraphNodeType < Types::BaseObject
  field :id, ID, null: false
  field :path, String, null: false
  field :module_name, String, null: false
  field :layer, String, null: false
  field :lang, String, null: false
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  
  field :scan, Types::ScanType, null: false
end
