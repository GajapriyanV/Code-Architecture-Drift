class CreateProjects < ActiveRecord::Migration[7.0]
  def change
    create_table :projects do |t|
      t.string :name, null: false
      t.string :repo_url, null: false
      t.string :default_branch, null: false, default: 'main'
      t.jsonb :rules_jsonb, default: {}
      t.bigint :github_installation_id

      t.timestamps
    end
    
    add_index :projects, :repo_url, unique: true
    add_index :projects, :github_installation_id
    add_index :projects, :rules_jsonb, using: :gin
  end
end
