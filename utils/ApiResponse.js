function ApiResponse(statusCode, data, message = "success") {
  return {
    statusCode: statusCode,
    data: data,
    message: message,
    success: statusCode < 400,
  };
}

export default ApiResponse;
