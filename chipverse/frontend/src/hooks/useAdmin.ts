// frontend/src/hooks/useAdmin.ts
import { useState } from "react";

const ADMIN_TOKEN_KEY = "chipverse_admin_token";
const ADMIN_INFO_KEY = "chipverse_admin_info";

export const API_BASE = "https://chipverse-production.up.railway.app";

export type AdminInfo = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
};

export function useAdmin() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(ADMIN_TOKEN_KEY)
  );
  const [admin, setAdmin] = useState<AdminInfo | null>(() => {
    try {
      const raw = localStorage.getItem(ADMIN_INFO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(data.admin));
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_INFO_KEY);
    setToken(null);
    setAdmin(null);
  };

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  return {
    token, admin, login, logout, authHeaders,
    isLoggedIn: !!token,
    isSuperAdmin: admin?.role === "SUPER_ADMIN",
  };
}