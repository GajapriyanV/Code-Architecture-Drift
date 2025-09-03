class ScanRepoJob < ApplicationJob
  queue_as :scans

  def perform(project_id:, ref:)
    project = Project.find(project_id)
    rules = project.rules
    
    Rails.logger.info "Starting scan for project #{project.name} at ref #{ref}"
    
    # Call the analyzer service
    result = AnalyzerClient.analyze!(
      repo_url: project.repo_url,
      ref: ref,
      rules: rules,
      token: ENV['GITHUB_TOKEN']
    )
    
    # Persist the results
    scan = ScanPersister.persist!(project, ref, result)
    
    Rails.logger.info "Scan completed for project #{project.name}. Drift score: #{scan.drift_score}"
    
    # TODO: Week 2 - Add PR status check here
    # if project.github_installation_id
    #   update_pr_status(project, ref, scan)
    # end
    
  rescue => e
    Rails.logger.error "Scan failed for project #{project_id}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    
    # TODO: Notify about scan failure
    raise e
  end
  
  private
  
  def update_pr_status(project, ref, scan)
    # TODO: Implement PR status update using Octokit
    # This will be implemented in Week 2
  end
end
