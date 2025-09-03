class Types::ProjectType < Types::BaseObject
  field :id, ID, null: false
  field :name, String, null: false
  field :repo_url, String, null: false
  field :default_branch, String, null: false
  field :rules_jsonb, GraphQL::Types::JSON, null: true
  field :github_installation_id, Integer, null: true
  field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  
  field :scans, [Types::ScanType], null: false
  field :latest_scan, Types::ScanType, null: true
  
  def latest_scan
    object.latest_scan
  end
end
