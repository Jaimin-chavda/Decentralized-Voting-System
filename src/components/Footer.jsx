import React from "react";
import { Link } from "react-router-dom";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "How it Works", href: "/#how" },
    { label: "Live Polls", href: "/#live-polls" },
    { label: "Pricing", href: "#" },
  ],
  Governance: [
    { label: "Create Proposal", href: "/admin" },
    { label: "Active Votes", href: "/vote" },
    { label: "Treasury", href: "#" },
    { label: "Delegation", href: "#" },
  ],
  Developers: [
    { label: "Documentation", href: "/docs" },
    { label: "Smart Contract", href: "#" },
    {
      label: "GitHub",
      href: "https://github.com/Jaimin-chavda/Decentralized-Voting-System",
      external: true,
    },
    { label: "API Reference", href: "#" },
  ],
  Resources: [
    { label: "Whitepaper", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Support", href: "#" },
    { label: "FAQ", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-bg-dark border-t border-border">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <span className="text-lg font-bold text-text-primary">
                GovChain
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              A decentralized governance platform built on blockchain for
              transparent decision-making.
            </p>

            {/* Badges */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border text-xs text-text-muted w-fit">
                <span className="w-2 h-2 rounded-full bg-success" />
                Built on Ethereum
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border text-xs text-text-muted w-fit">
                ⚡ Powered by Smart Contracts
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-text-primary mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-muted hover:text-primary transition-colors duration-300"
                      >
                        {link.label} ↗
                      </a>
                    ) : link.href.startsWith("/") &&
                      !link.href.includes("#") ? (
                      <Link
                        to={link.href}
                        className="text-sm text-text-muted hover:text-primary transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-text-muted hover:text-primary transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contract Info */}
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
              <span>
                Network:{" "}
                <span className="text-primary font-medium">
                  Sepolia Testnet
                </span>
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="font-mono text-[11px]">
                Contract: 0x5FbDB...0aa3
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Jaimin-chavda/Decentralized-Voting-System"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
                title="GitHub"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © 2026 GovChain. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a href="#" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
