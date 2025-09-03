class Types::ScanCountsType < Types::BaseObject
  field :nodes, Integer, null: false
  field :edges, Integer, null: false
  field :violations, Integer, null: false
end
