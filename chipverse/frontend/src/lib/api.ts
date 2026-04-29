// ChipVerse API Client
// Connects frontend to the Express backend

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

let _accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  _accessToken = token;
};

export const getAccessToken = () => _accessToken;

const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ..._accessToken ? { Authorization: `Bearer ${_accessToken}` } : {},
});

const request = async <T>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ data: T; message: string }> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(),
    credentials: 'include', // Send cookies
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? 'Request failed');
  }

  return json;
};

// ─── Auth API ────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (data: { name: string; email: string; phone?: string; password: string }) =>
      request<{ user: any; accessToken: string }>('POST', '/auth/register', data),

    login: (data: { email: string; password: string }) =>
      request<{ user: any; accessToken: string }>('POST', '/auth/login', data),

    sendOtp: (phone: string) =>
      request<{ phone: string }>('POST', '/auth/otp/send', { phone }),

    verifyOtp: (phone: string, code: string, name?: string) =>
      request<{ user: any; accessToken: string }>('POST', '/auth/otp/verify', {
        phone,
        code,
        name,
      }),

    logout: () => request<null>('POST', '/auth/logout'),

    refreshToken: () =>
      request<{ accessToken: string }>('POST', '/auth/refresh'),

    me: () => request<any>('GET', '/auth/me'),

    googleLoginUrl: () => `${API_BASE}/auth/google`,
    linkedinLoginUrl: () => `${API_BASE}/auth/linkedin`,
  },

  user: {
    getProfile: () => request<any>('GET', '/user/profile'),

    completeLevel: (domainId: string, levelId: number, xpGained: number) =>
      request<any>('POST', '/user/progress', { domainId, levelId, xpGained }),

    setDomain: (domainId: string) =>
      request<any>('PATCH', '/user/domain', { domainId }),
  },
};

export default api;
