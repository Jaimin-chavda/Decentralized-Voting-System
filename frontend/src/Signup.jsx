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

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const result = await signup(formData.name, formData.email, formData.password);
    if (result.success) {
      addToast({
        message: "Account created! Welcome to VoteChain.",
        type: "success",
      });
      navigate("/");
    } else {
      setError(result.error || "Signup failed. Please try again.");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-border rounded-xl text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200";

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[128px] animate-glow pointer-events-none" />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[128px] animate-glow pointer-events-none"
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
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="9 11 12 14 22 4"></polyline>
  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
</svg>
              <span className="text-xl font-bold text-text-primary">
                VoteChain
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              Create an Account
            </h1>
            <p className="text-sm text-text-muted">
              Join the decentralized governance platform
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>

            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                required
                className="mt-1 w-4 h-4 rounded border-border bg-white/5 accent-primary"
              />
              <span className="text-xs text-text-muted leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              Sign Up
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">Or signed up with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={() => navigate("/wallet-connect")}
            className="w-full py-3 text-sm font-semibold text-text-primary glass rounded-xl hover:bg-white/[0.08] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span className="text-lg">🦊</span>
            Connect with MetaMask
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
