/**
 * Extracts a clear, user-friendly error message from an API error response.
 * Handles Axios, fetch, NestJS validation arrays, and standard Error instances.
 */
export function getErrorMessage(error: any, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallback;

  // Axios or fetch JSON payload
  const responseData = error.response?.data;
  if (responseData) {
    // NestJS class-validator array of validation errors
    if (Array.isArray(responseData.message) && responseData.message.length > 0) {
      return responseData.message.join('. ');
    }
    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }
    if (typeof responseData.error === 'string' && responseData.error.trim()) {
      return responseData.error;
    }
  }

  // Direct error message on Error instance
  if (typeof error.message === 'string' && error.message.trim()) {
    // Avoid raw network code errors like "Network Error" when possible
    if (error.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    return error.message;
  }

  // String error
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

