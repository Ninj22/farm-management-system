import { createContext, useContext, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "../lib/api";

export type Role = "ADMIN" | "FARM_MANAGER" | "INVENTORY_STAFF" | "VETERINARY_STAFF" | "SALES_STAFF" | "GENERAL_STAFF";

interface TokenPayload {
  sub: string;
  role: Role;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  role: Role | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeRole(token: string | null): Role | null {
  if (!token) return null;
  try {
    return jwtDecode<TokenPayload>(token).role;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<Role | null>(decodeRole(localStorage.getItem("token")));

  async function login(email: string, password: string) {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const res = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    localStorage.setItem("token", res.data.access_token);
    setToken(res.data.access_token);
    setRole(decodeRole(res.data.access_token));
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
  }

  return <AuthContext.Provider value={{ token, role, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
