class GraphqlController < ApplicationController
  def execute
    variables = prepare_variables(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]
    context = {
      # Add any context you need for your GraphQL queries
    }
    result = DriftRailsSchema.execute(query, variables: variables, context: context, operation_name: operation_name)
    render json: result
  rescue StandardError => e
    raise e unless Rails.env.development?
    handle_error_in_development(e)
  end

  private

  def prepare_variables(variables_param)
    case variables_param
    when String
      variables_param.present? ? JSON.parse(variables_param) : {}
    when Hash
      variables_param
    when ActionController::Parameters
      variables_param.to_unsafe_h
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{variables_param.class}"
    end
  end

  def handle_error_in_development(e)
    logger.error e.message
    logger.error e.backtrace.join("\n")

    render json: { errors: [{ message: e.message, backtrace: e.backtrace }], data: {} },
           status: :internal_server_error
  end
end
