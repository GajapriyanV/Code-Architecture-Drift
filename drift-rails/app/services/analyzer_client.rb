class AnalyzerClient
  def self.analyze!(repo_url:, ref:, rules:, token:)
    conn = Faraday.new(url: ENV.fetch('ANALYZER_URL', 'http://localhost:8000')) do |f|
      f.request :json
      f.response :json
      f.adapter Faraday.default_adapter
    end
    
    payload = {
      git: {
        repo_url: repo_url,
        ref: ref,
        token: token
      },
      rules: rules,
      mode: 'full'
    }
    
    Rails.logger.info "Sending analysis request to analyzer: #{payload[:git][:repo_url]}"
    
    response = conn.post('/analyze', payload)
    
    if response.success?
      response.body
    else
      Rails.logger.error "Analyzer request failed: #{response.status} - #{response.body}"
      raise "Analyzer request failed: #{response.status}"
    end
    
  rescue Faraday::ConnectionFailed => e
    Rails.logger.error "Failed to connect to analyzer: #{e.message}"
    raise "Analyzer service unavailable"
  rescue => e
    Rails.logger.error "Analyzer client error: #{e.message}"
    raise e
  end
end
