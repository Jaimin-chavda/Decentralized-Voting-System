import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { loginAuthUser, registerAuthUser } from "../manage/authApi";

const AuthContext = createContext(null);

// Hook to access auth state from any component
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Persist key for active session
const LS_AUTH_KEY = "votechain_auth";

const ADMIN_ROLES = [
  "admin",
  "SUPER_ADMIN",
  "UNIVERSITY_ADMIN",
  "INSTITUTE_ADMIN",
  "DEPARTMENT_ADMIN",
  "CLASS_ADMIN",
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Active session: { name, email, role }

  // Initialize session on mount
  useEffect(() => {
    try {
      // Load active session
      const storedSession = localStorage.getItem(LS_AUTH_KEY);
      if (storedSession) setUser(JSON.parse(storedSession));
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  // Save to localStorage whenever active user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_AUTH_KEY);
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginAuthUser({ email, password });
      const sessionUser = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        isWhitelisted: data.isWhitelisted,
      };

      setUser(sessionUser);
      return { success: true, role: data.role };
    } catch (error) {
      return { success: false, error: error.message || "Invalid email or password" };
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    try {
      const data = await registerAuthUser({ name, email, password });
      const sessionUser = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        isWhitelisted: data.isWhitelisted,
      };

      setUser(sessionUser);
      return { success: true, role: data.role };
    } catch (error) {
      return { success: false, error: error.message || "Signup failed" };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = ADMIN_ROLES.includes(user?.role);

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
