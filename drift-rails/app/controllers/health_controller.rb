class HealthController < ApplicationController
  def check
    render json: {
      status: "healthy",
      service: "drift-rails",
      timestamp: Time.current.iso8601,
      environment: Rails.env
    }
  end
end
