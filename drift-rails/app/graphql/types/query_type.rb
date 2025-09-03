class Types::QueryType < Types::BaseObject
  field :project, Types::ProjectType, null: true do
    argument :id, ID, required: true
  end
  
  field :projects, [Types::ProjectType], null: false
  
  field :scan, Types::ScanType, null: true do
    argument :id, ID, required: true
  end
  
  def project(id:)
    Project.find(id)
  end
  
  def projects
    Project.all
  end
  
  def scan(id:)
    Scan.find(id)
  end
end
