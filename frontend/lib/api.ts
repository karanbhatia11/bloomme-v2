const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiCall = async (
  endpoint: string,
  options: RequestInit & { token?: string } = {}
) => {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `API error: ${response.status}`);
  }

  return response.json();
};

export const auth = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (name: string, phone: string, email: string, password: string) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, phone, email, password }),
    }),
};

export const dashboard = {
  getStats: (token: string) =>
    apiCall('/dashboard/stats', { token, method: 'GET' }),
};
