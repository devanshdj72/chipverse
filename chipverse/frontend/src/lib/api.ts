const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

let _accessToken: string | null = null;
export const setAccessToken = (token: string) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;

const getHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ..._accessToken ? { Authorization: `Bearer ${_accessToken}` } : {},
});

const request = async <T>(method: string, path: string, body?: unknown): Promise<{ data: T; message: string }> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(),
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json;
};

export const api = {
  auth: {
    register: (data: { name: string; email: string; phone?: string; password: string }) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('POST', '/auth/register', data),

    login: (data: { email: string; password: string }) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('POST', '/auth/login', data),

    sendOtp: (phone: string) =>
      request<{ phone: string }>('POST', '/auth/otp/send', { phone }),

    verifyOtp: (phone: string, code: string, name?: string) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('POST', '/auth/otp/verify', { phone, code, name }),

    logout: (refreshToken?: string) =>
      request<null>('POST', '/auth/logout', refreshToken ? { refreshToken } : undefined),

    refreshToken: (refreshToken?: string) =>
      request<{ accessToken: string; refreshToken: string }>('POST', '/auth/refresh', refreshToken ? { refreshToken } : undefined),

    me: () => request<any>('GET', '/auth/me'),
    googleLoginUrl: () => `${API_BASE}/auth/google`,
    linkedinLoginUrl: () => `${API_BASE}/auth/linkedin`,
  },

  lab: {
    evaluate: (data: any) => request<any>('POST', '/lab/evaluate', data),
  },

  user: {
    getProfile: () => request<any>('GET', '/user/profile'),
    completeLevel: (domainId: string, levelId: number, xpGained: number) =>
      request<any>('POST', '/user/progress', { domainId, levelId, xpGained }),
    setDomain: (domainId: string) => request<any>('PATCH', '/user/domain', { domainId }),
    getLeaderboard: () => request<any[]>('GET', '/user/leaderboard'),
    getSiteStats: () => request<any>('GET', '/user/stats'),
    addXp: (xp: number) => request<any>('POST', '/user/xp', { xp }),
    updateProfile: (data: { name?: string; avatarUrl?: string }) =>
      request<any>('PATCH', '/user/profile', data),                         // ← NEW
    savePresetAvatar: (avatarId: string) =>
      request<any>('PATCH', '/user/avatar/preset', { avatarId }),           // ← NEW
    saveCustomAvatar: (config: any) =>
      request<any>('PATCH', '/user/avatar/custom', config),                 // ← NEW
    getAvatars: () =>
      request<any>('GET', '/user/avatar'),                                  // ← NEW
  },

  friends: {
    search: (q: string) => request<any[]>('GET', `/friends/search?q=${encodeURIComponent(q)}`),
    getAll: () => request<any[]>('GET', '/friends'),
    getRequests: () => request<any[]>('GET', '/friends/requests'),
    getSentRequests: () => request<any[]>('GET', '/friends/requests/sent'),
    getLeaderboard: () => request<any[]>('GET', '/friends/leaderboard'),
    sendRequest: (receiverId: string) => request<any>('POST', '/friends/request', { receiverId }),
    respondRequest: (requestId: string, action: 'accept' | 'reject') =>
      request<any>('PATCH', `/friends/request/${requestId}`, { action }),
    unfriend: (friendId: string) => request<any>('DELETE', `/friends/${friendId}`),
  },

  battles: {
    getAll: () => request<any[]>('GET', '/battles'),
    get: (battleId: string) => request<any>('GET', `/battles/${battleId}`),
    challenge: (opponentId: string, domainId: string, betXp: number, mode: 'LIVE' | 'OFFLINE' = 'OFFLINE') =>
      request<any>('POST', '/battles/challenge', { opponentId, domainId, betXp, mode }),
    respond: (battleId: string, action: 'accept' | 'decline') =>
      request<any>('PATCH', `/battles/${battleId}/respond`, { action }),
    submitScore: (battleId: string, score: number, timeTakenMs: number = 0) =>
      request<any>('POST', `/battles/${battleId}/score`, { score, timeTakenMs }),
  },

  notifications: {
    getAll: () => request<any[]>('GET', '/notifications'),
    getUnreadCount: () => request<{ count: number }>('GET', '/notifications/unread-count'),
    markAllRead: () => request<null>('PATCH', '/notifications/read'),
    markRead: (id: string) => request<null>('PATCH', `/notifications/${id}/read`),
  },

  chat: {
    getConversations: () => request<any[]>('GET', '/chat/conversations'),
    openDM: (friendId: string) => request<any>('POST', '/chat/dm', { friendId }),
    createGroup: (name: string, memberIds: string[]) =>
      request<any>('POST', '/chat/group', { name, memberIds }),
    getMessages: (conversationId: string) =>
      request<any[]>('GET', `/chat/conversations/${conversationId}/messages`),
    addMember: (conversationId: string, newUserId: string) =>
      request<any>('POST', `/chat/conversations/${conversationId}/members`, { newUserId }),
  },
};

export default api;