class GraphEdge < ApplicationRecord
  belongs_to :scan
  
  validates :from_path, presence: true
  validates :to_path, presence: true
  validates :edge_type, presence: true
end
