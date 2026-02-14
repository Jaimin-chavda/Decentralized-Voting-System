import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { DEMO_ADMIN, DEMO_USER } from "../data/demoData";

const AuthContext = createContext(null);

// Hook to access auth state from any component
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Persist key
const LS_AUTH_KEY = "govchain_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { name, email, role }

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_AUTH_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_AUTH_KEY);
    }
  }, [user]);

  // Login — checks against demo credentials, returns { success, role } or { success: false }
  const login = useCallback((email, password) => {
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const u = {
        name: DEMO_ADMIN.name,
        email: DEMO_ADMIN.email,
        role: "admin",
      };
      setUser(u);
      return { success: true, role: "admin" };
    }
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const u = { name: DEMO_USER.name, email: DEMO_USER.email, role: "user" };
      setUser(u);
      return { success: true, role: "user" };
    }
    return { success: false };
  }, []);

  // Signup — creates a new user session (demo: any valid input works)
  const signup = useCallback((name, email, password) => {
    // In a real app you'd call an API. Here we just create a session.
    const u = { name, email, role: "user" };
    setUser(u);
    return { success: true };
  }, []);

  // Update profile
  const updateProfile = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // Logout — also disconnects wallet
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("walletConnected");
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
