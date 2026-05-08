// import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// export type Role = "employee" | "moderator";

// export type User = {
//   email: string;
//   name: string;
//   role: Role;
// };

// const DEMO_USERS: Record<string, { password: string; user: User }> = {
//   "employee@example.com": {
//     password: "employee123",
//     user: { email: "employee@example.com", name: "Alex Employee", role: "employee" },
//   },
//   "moderator@example.com": {
//     password: "mod123",
//     user: { email: "moderator@example.com", name: "Morgan Moderator", role: "moderator" },
//   },
// };

// const STORAGE_KEY = "grant-prompts-auth-user";

// type AuthContextValue = {
//   user: User | null;
//   login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (raw) setUser(JSON.parse(raw));
//     } catch {
//       /* ignore */
//     }
//   }, []);

//   const login = (email: string, password: string) => {
//     const entry = DEMO_USERS[email.toLowerCase().trim()];
//     if (!entry || entry.password !== password) {
//       return { ok: false as const, error: "Invalid email or password." };
//     }
//     setUser(entry.user);
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.user));
//     } catch {
//       /* ignore */
//     }
//     return { ok: true as const };
//   };

//   const logout = () => {
//     setUser(null);
//     try {
//       localStorage.removeItem(STORAGE_KEY);
//     } catch {
//       /* ignore */
//     }
//   };

//   return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// };

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "employee" | "moderator";

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

const STORAGE_KEY = "grant-prompts-auth-user";
const TOKEN_KEY = "grant-prompts-auth-token";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type AuthResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  getAllUsers: () => User[];
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const mapBackendRole = (role: string): Role => (role === "USER" ? "employee" : "moderator");

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem(STORAGE_KEY);
      const rawToken = localStorage.getItem(TOKEN_KEY);
      if (rawUser) setUser(JSON.parse(rawUser));
      if (rawToken) setToken(rawToken);
    } catch {
      /* ignore */
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        return { ok: false, error: payload?.message ?? "Login failed." };
      }

      const nextUser: User = {
        id: payload.user.id,
        email: payload.user.email,
        name: payload.user.name,
        role: mapBackendRole(payload.user.role),
      };

      setUser(nextUser);
      setToken(payload.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      localStorage.setItem(TOKEN_KEY, payload.token);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to connect to backend." };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  };

  const getAllUsers = () => {
    return user ? [user] : [];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, getAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};