class CreateViolations < ActiveRecord::Migration[7.0]
  def change
    create_table :violations do |t|
      t.references :scan, null: false, foreign_key: true
      t.string :node_path, null: false
      t.string :rule_code, null: false
      t.string :severity, null: false, default: 'medium'
      t.text :details, null: false
      t.text :suggestion

      t.timestamps
    end
    
    add_index :violations, :node_path
    add_index :violations, :rule_code
    add_index :violations, :severity
  end
end
