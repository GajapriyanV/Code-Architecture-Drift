class ScanPersister
  def self.persist!(project, ref, result)
    ActiveRecord::Base.transaction do
      # Create the scan record
      scan = project.scans.create!(
        git_sha: ref,
        mode: 'full',
        drift_score: result.dig('metrics', 'drift_score') || 0.0
      )
      
      # Persist graph nodes
      Array(result['nodes']).each do |node_data|
        scan.graph_nodes.create!(
          path: node_data['path'],
          module_name: node_data['module_name'],
          layer: node_data['layer'],
          lang: node_data['lang']
        )
      end
      
      # Persist graph edges
      Array(result['edges']).each do |edge_data|
        scan.graph_edges.create!(
          from_path: edge_data['from_path'],
          to_path: edge_data['to_path'],
          edge_type: edge_data['edge_type']
        )
      end
      
      # Persist violations
      Array(result['violations']).each do |violation_data|
        scan.violations.create!(
          node_path: violation_data['node_path'],
          rule_code: violation_data['rule_code'],
          severity: violation_data['severity'],
          details: violation_data['details'],
          suggestion: violation_data['suggestion']
        )
      end
      
      scan
    end
    
  rescue => e
    Rails.logger.error "Failed to persist scan results: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise e
  end
end
