class CreateGraphEdges < ActiveRecord::Migration[7.0]
  def change
    create_table :graph_edges do |t|
      t.references :scan, null: false, foreign_key: true
      t.string :from_path, null: false
      t.string :to_path, null: false
      t.string :edge_type, null: false

      t.timestamps
    end
    
    add_index :graph_edges, :from_path
    add_index :graph_edges, :to_path
    add_index :graph_edges, :edge_type
  end
end
