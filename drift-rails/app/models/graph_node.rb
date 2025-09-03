class GraphNode < ApplicationRecord
  belongs_to :scan
  
  validates :path, presence: true
  validates :module_name, presence: true
  validates :layer, presence: true
  validates :lang, presence: true
end
