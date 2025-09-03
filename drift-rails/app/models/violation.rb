class Violation < ApplicationRecord
  belongs_to :scan
  
  validates :node_path, presence: true
  validates :rule_code, presence: true
  validates :severity, presence: true
  validates :details, presence: true
  
  enum severity: { low: 'low', medium: 'medium', high: 'high' }
  
  def rule_code
    self[:rule_code]&.upcase
  end
end
