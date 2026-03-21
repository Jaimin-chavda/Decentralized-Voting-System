import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./utils/toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function UserProfile() {
  const { user, updateProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (!user) {
    navigate("/login");
    return null;
  }

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, email });
    setSaved(true);
    addToast({ message: "Profile updated successfully!", type: "success" });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast({ message: "Enter your current password.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      addToast({
        message: "New password must be at least 6 characters.",
        type: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ message: "Passwords do not match.", type: "error" });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    addToast({ message: "Password changed successfully!", type: "success" });
  };

  const handleLogout = () => {
    logout();
    addToast({ message: "Logged out.", type: "info" });
    navigate("/");
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-bg-dark/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="9 11 12 14 22 4"></polyline>
  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
</svg>
            <span className="text-lg font-bold text-text-primary">
              VoteChain
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">👤 {user.name}</span>
            {isAdmin && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">
                Admin
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:w-72 shrink-0"
          >
            <div className="glass rounded-2xl p-6 text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl text-white font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <h2 className="text-lg font-bold text-text-primary">
                {user.name}
              </h2>
              <p className="text-sm text-text-muted mb-3">{user.email}</p>
              <span
                className={`inline-block text-[11px] font-bold px-3 py-1 rounded-lg uppercase ${
                  isAdmin
                    ? "bg-primary/10 text-primary"
                    : "bg-success/10 text-success"
                }`}
              >
                {isAdmin ? "Administrator" : "Member"}
              </span>
            </div>

            <nav className="glass rounded-2xl p-3 space-y-1">
              <Link
                to="/"
                className="block w-full px-4 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-white/5 rounded-xl transition-all text-left"
              >
                ← Back to Home
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block w-full px-4 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-white/5 rounded-xl transition-all text-left"
                >
                  🛠 Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2.5 text-sm text-text-muted hover:text-danger hover:bg-danger/5 rounded-xl transition-all text-left"
              >
                🚪 Logout
              </button>
            </nav>
          </motion.aside>

          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="flex-1 space-y-6"
          >
            {/* Profile Details */}
            <motion.div
              variants={fadeUp}
              className="glass rounded-2xl p-6 lg:p-8"
            >
              <h3 className="text-lg font-bold text-text-primary mb-6">
                Profile Details
              </h3>
              <form onSubmit={handleSaveProfile}>
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={isAdmin ? "Administrator" : "Member"}
                      disabled
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Joined
                    </label>
                    <input
                      type="text"
                      value="February 2026"
                      disabled
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                >
                  {saved ? "✓ Saved" : "Save Changes"}
                </button>
              </form>
            </motion.div>

            {/* Change Password */}
            <motion.div
              variants={fadeUp}
              custom={1}
              className="glass rounded-2xl p-6 lg:p-8"
            >
              <h3 className="text-lg font-bold text-text-primary mb-6">
                Change Password
              </h3>
              <form onSubmit={handleChangePassword}>
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                >
                  Update Password
                </button>
              </form>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              variants={fadeUp}
              custom={2}
              className="glass rounded-2xl p-6 lg:p-8 border border-danger/10"
            >
              <h3 className="text-lg font-bold text-danger mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-text-muted mb-4">
                Logging out will end your session. You will need to sign in
                again.
              </p>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-danger rounded-xl hover:bg-danger/80 transition-all duration-300"
              >
                🚪 Logout
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
