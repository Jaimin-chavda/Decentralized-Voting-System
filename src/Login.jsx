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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const result = login(email, password);
    if (result.success) {
      addToast({ message: "Signed in successfully!", type: "success" });
      if (result.role === "admin") navigate("/admin");
      else navigate("/");
    } else {
      setError("Invalid email or password. Try the demo credentials below.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px] animate-glow pointer-events-none" />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[128px] animate-glow pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="relative w-full max-w-md"
      >
        <motion.div
          variants={fadeUp}
          className="glass rounded-3xl p-8 lg:p-10 shadow-2xl shadow-black/20"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <span className="text-xl font-bold text-text-primary">
                GovChain
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              Welcome Back
            </h1>
            <p className="text-sm text-text-muted">Sign in to your account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-white/5 accent-primary"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              Sign In
            </button>
          </form>

          {/* Demo Hint */}
          <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-text-muted">
            <strong className="text-primary">Demo:</strong> admin@govchain.io /
            admin123 (admin) or user@govchain.io / user123 (user)
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">Or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Wallet Button */}
          <button
            onClick={() => navigate("/wallet-connect")}
            className="w-full py-3 text-sm font-semibold text-text-primary glass rounded-xl hover:bg-white/[0.08] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span className="text-lg">🦊</span>
            Connect with MetaMask
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
