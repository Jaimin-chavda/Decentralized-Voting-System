import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: "/vote", label: "Campaigns" },
    { href: "/#features", label: "Features" },
    { href: "/#how", label: "How it Works" },
    { href: "/docs", label: "Docs" },
  ];

  const isActive = (href) => {
    if (href.startsWith("/#"))
      return location.pathname === "/" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg-dark/80 backdrop-blur-xl border-b border-border shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="9 11 12 14 22 4"></polyline>
  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
</svg>
            <span className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors duration-300">
              VoteChain
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {/* Hover underline effect */}
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                {/* Hover background */}
                <span className="absolute inset-0 rounded-lg bg-white/5 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-300"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  {user?.name || "Profile"}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary border border-border rounded-xl hover:border-primary/50 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
            <button
              onClick={() => navigate("/wallet-connect")}
              className="relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              Connect Wallet
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${
                  mobileOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-text-primary transition-all duration-300 ${
                  mobileOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-bg-dark/95 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-all duration-200 text-left"
                  >
                    👤 {user?.name || "Profile"}
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary rounded-lg transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary rounded-lg transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
                <button
                  onClick={() => navigate("/wallet-connect")}
                  className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl text-center"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
