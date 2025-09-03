class Project < ApplicationRecord
  has_many :scans, dependent: :destroy
  
  validates :name, presence: true
  validates :repo_url, presence: true, uniqueness: true
  validates :default_branch, presence: true
  
  def latest_scan
    scans.order(created_at: :desc).first
  end
  
  def rules
    rules_jsonb || {}
  end
end
