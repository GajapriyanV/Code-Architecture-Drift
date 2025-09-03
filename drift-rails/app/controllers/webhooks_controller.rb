class WebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token
  
  def github
    payload = JSON.parse(request.raw_post)
    
    # Extract repository information
    repo_url = payload.dig("repository", "clone_url")
    sha = payload["after"] || payload.dig("head_commit", "id")
    
    if repo_url && sha
      project = Project.find_by(repo_url: repo_url)
      
      if project
        ScanRepoJob.perform_later(project_id: project.id, ref: sha)
        render json: { status: "scan_enqueued", project: project.name }, status: :ok
      else
        render json: { error: "Project not found for repository: #{repo_url}" }, status: :not_found
      end
    else
      render json: { error: "Invalid webhook payload" }, status: :bad_request
    end
  rescue JSON::ParserError
    render json: { error: "Invalid JSON payload" }, status: :bad_request
  rescue => e
    Rails.logger.error "Webhook error: #{e.message}"
    render json: { error: "Internal server error" }, status: :internal_server_error
  end
end
