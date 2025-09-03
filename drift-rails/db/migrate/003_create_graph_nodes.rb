class CreateGraphNodes < ActiveRecord::Migration[7.0]
  def change
    create_table :graph_nodes do |t|
      t.references :scan, null: false, foreign_key: true
      t.string :path, null: false
      t.string :module_name, null: false
      t.string :layer, null: false
      t.string :lang, null: false

      t.timestamps
    end
    
    add_index :graph_nodes, :path
    add_index :graph_nodes, :layer
    add_index :graph_nodes, :lang
  end
end
