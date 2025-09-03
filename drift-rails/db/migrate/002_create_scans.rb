class CreateScans < ActiveRecord::Migration[7.0]
  def change
    create_table :scans do |t|
      t.references :project, null: false, foreign_key: true
      t.string :git_sha, null: false
      t.string :mode, null: false, default: 'full'
      t.decimal :drift_score, precision: 3, scale: 2, default: 0.0

      t.timestamps
    end
    
    add_index :scans, :git_sha
    add_index :scans, :created_at
  end
end
