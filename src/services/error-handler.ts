
// Global error handler for API requests

export class APIError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export const handleAPIError = (error: unknown): APIError => {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new APIError(error.message);
  }
  
  return new APIError('Unknown error occurred');
};

export const errorToast = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Unknown error occurred';
};

// Function to safely fetch data with error handling
export const safeFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new APIError(`API error: ${response.status} ${response.statusText}`, response.status);
    }
    
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new APIError('Network error or CORS issue. Please check your internet connection.', 0);
    }
    
    throw error;
  }
};
