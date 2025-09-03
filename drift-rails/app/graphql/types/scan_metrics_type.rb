class Types::ScanMetricsType < Types::BaseObject
  field :drift_score, Float, null: false
  field :counts, Types::ScanCountsType, null: false
end
