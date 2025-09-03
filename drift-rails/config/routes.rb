Rails.application.routes.draw do
  # GraphQL endpoint
  post "/graphql", to: "graphql#execute"
  
  # GitHub webhooks
  post "/webhooks/github", to: "webhooks#github"
  
  # Health check
  get "/health", to: "health#check"
  
  # Mount Sidekiq dashboard in development
  if Rails.env.development?
    require "sidekiq/web"
    mount Sidekiq::Web => "/sidekiq"
  end
  
  # Root endpoint
  root "health#check"
end
