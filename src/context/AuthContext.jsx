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

// Persist keys for local database
const LS_AUTH_KEY = "votechain_auth";
const LS_USERS_DB_KEY = "votechain_users_db";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Active session: { name, email, role }
  const [usersDb, setUsersDb] = useState([]); // All registered users

  // Initialize Local Fake Database & Session on mount
  useEffect(() => {
    try {
      // 1. Load users DB
      let storedDb = localStorage.getItem(LS_USERS_DB_KEY);
      if (!storedDb) {
        // Seed database with DEMO accounts if empty
        storedDb = [
          { name: DEMO_ADMIN.name, email: DEMO_ADMIN.email, password: DEMO_ADMIN.password, role: "admin" },
          { name: DEMO_USER.name, email: DEMO_USER.email, password: DEMO_USER.password, role: "user" },
        ];
        localStorage.setItem(LS_USERS_DB_KEY, JSON.stringify(storedDb));
      } else {
        storedDb = JSON.parse(storedDb);
      }
      setUsersDb(storedDb);

      // 2. Load active session
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

  // Login — checks against our local storage users database
  const login = useCallback((email, password) => {
    const existingUsers = JSON.parse(localStorage.getItem(LS_USERS_DB_KEY) || "[]");
    
    // Find matching user
    const matchedUser = existingUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (matchedUser) {
      const sessionUser = {
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
      };
      setUser(sessionUser);
      return { success: true, role: matchedUser.role };
    }
    
    return { success: false, error: "Invalid email or password" };
  }, []);

  // Signup — creates a new persistent user account in the local storage database
  const signup = useCallback((name, email, password) => {
    const existingUsers = JSON.parse(localStorage.getItem(LS_USERS_DB_KEY) || "[]");
    
    // Check if email is already taken
    const emailExists = existingUsers.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Register new user
    const newUser = { name, email, password, role: "user" };
    const updatedDb = [...existingUsers, newUser];
    
    // Save to DB
    localStorage.setItem(LS_USERS_DB_KEY, JSON.stringify(updatedDb));
    setUsersDb(updatedDb);

    // Auto-login after signup
    const sessionUser = { name, email, role: "user" };
    setUser(sessionUser);
    
    return { success: true, role: "user" };
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
