class Scan < ApplicationRecord
  belongs_to :project
  has_many :graph_nodes, dependent: :destroy
  has_many :graph_edges, dependent: :destroy
  has_many :violations, dependent: :destroy
  
  validates :git_sha, presence: true
  validates :mode, presence: true
  validates :drift_score, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }
  
  enum mode: { full: 'full', incremental: 'incremental' }
  
  def metrics
    {
      drift_score: drift_score,
      counts: {
        nodes: graph_nodes.count,
        edges: graph_edges.count,
        violations: violations.count
      }
    }
  end
end
