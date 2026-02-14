import React from "react";
import { motion } from "framer-motion";
import LivePolls from "./LivePolls";

/* ─── Animation Variants ──────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Data ────────────────────────────────────────────── */
const stats = [
  { value: "1.2K+", label: "Active Users", icon: "👥" },
  { value: "89", label: "Proposals", icon: "📋" },
  { value: "$2.4M", label: "Treasury", icon: "💰" },
];

const features = [
  {
    icon: "🗳️",
    title: "On-Chain Voting",
    desc: "Cast votes directly on the blockchain with full transparency and immutability.",
  },
  {
    icon: "📝",
    title: "Transparent Proposals",
    desc: "Every proposal is publicly visible, auditable, and stored permanently on-chain.",
  },
  {
    icon: "🔐",
    title: "Wallet Authentication",
    desc: "Connect with MetaMask for secure identity verification without passwords.",
  },
  {
    icon: "👑",
    title: "Role-Based Governance",
    desc: "Flexible roles from delegates to admins with configurable permissions.",
  },
  {
    icon: "⚡",
    title: "Proposal Execution",
    desc: "Smart contracts automatically execute approved proposals when thresholds are met.",
  },
  {
    icon: "📊",
    title: "Event Logs",
    desc: "Complete audit trail of every governance action for maximum accountability.",
  },
  {
    icon: "🏦",
    title: "Treasury Tracking",
    desc: "Real-time visibility into fund allocations, spending, and reserves.",
  },
  {
    icon: "⚖️",
    title: "Token-Weighted Voting",
    desc: "Voting power proportional to token holdings for fair representation.",
  },
];

const steps = [
  {
    num: "01",
    icon: "🔗",
    title: "Connect Wallet",
    desc: "Link your MetaMask wallet to verify your identity and governance token holdings on-chain.",
  },
  {
    num: "02",
    icon: "📝",
    title: "Create Proposal",
    desc: "Draft and submit governance proposals with descriptions, options, and voting parameters.",
  },
  {
    num: "03",
    icon: "🗳️",
    title: "Community Votes",
    desc: "Token holders review proposals and cast weighted votes within the defined voting period.",
  },
  {
    num: "04",
    icon: "⚡",
    title: "Smart Contract Executes",
    desc: "Once approved, the smart contract automatically and trustlessly executes the decision.",
  },
];

/* ─── Component ───────────────────────────────────────── */
export default function Homepage() {
  return (
    <div className="bg-bg-dark min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        {/* Background glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[128px] animate-glow pointer-events-none" />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[128px] animate-glow pointer-events-none"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Decentralized Governance
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6"
              >
                <span className="text-text-primary">Govern Your </span>
                <span className="gradient-text">Community</span>
                <br />
                <span className="text-text-primary">On-Chain</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-lg text-text-muted leading-relaxed max-w-lg mb-8"
              >
                Create proposals, vote transparently, and make decisions
                together. All powered by blockchain technology for trustless,
                tamper-proof governance.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap gap-4"
              >
                <a
                  href="/signup"
                  className="px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-2xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                >
                  Get Started
                </a>
                <a
                  href="#live-polls"
                  className="px-7 py-3.5 text-sm font-semibold text-text-primary glass rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  View Polls ↓
                </a>
              </motion.div>
            </motion.div>

            {/* Right — Stat Cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex flex-col gap-5"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  custom={i + 2}
                  className="glass rounded-2xl p-6 flex items-center gap-5 group hover:bg-white/[0.08] transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-text-primary">
                      {stat.value}
                    </div>
                    <div className="text-sm text-text-muted">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ LIVE POLLS ═══ */}
      <LivePolls />

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium"
            >
              Features
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold text-text-primary mb-4"
            >
              Everything You Need for{" "}
              <span className="gradient-text">Decentralized Governance</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-text-muted max-w-xl mx-auto"
            >
              A complete suite of tools designed for transparent, trustless, and
              efficient community decision-making.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-6 group hover:bg-white/[0.08] hover:border-primary/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="py-24 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium"
            >
              Process
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold text-text-primary mb-4"
            >
              How <span className="gradient-text">GovChain</span> Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-text-muted max-w-xl mx-auto"
            >
              From wallet connection to on-chain execution — four simple steps
              to decentralized decision-making.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          >
            {/* Desktop connector line */}
            <div className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/30 via-accent/30 to-success/30" />

            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                custom={i}
                className="relative glass rounded-2xl p-6 text-center hover:bg-white/[0.08] transition-all duration-300 group"
              >
                {/* Step number badge */}
                <div className="relative z-10 w-12 h-12 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                  {s.num}
                </div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="relative glass rounded-3xl p-12 lg:p-16 text-center overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/15 rounded-full blur-[80px] pointer-events-none" />

            <motion.h2
              variants={fadeUp}
              className="relative text-3xl sm:text-4xl font-bold text-text-primary mb-4"
            >
              Ready to <span className="gradient-text">Decentralize</span> Your
              Governance?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="relative text-text-muted mb-8 max-w-lg mx-auto"
            >
              Join hundreds of communities already using GovChain for
              transparent, trustless decision-making.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="relative flex flex-wrap gap-4 justify-center"
            >
              <a
                href="/signup"
                className="px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-2xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                Get Started Free
              </a>
              <a
                href="/docs"
                className="px-8 py-3.5 text-sm font-semibold text-text-primary glass rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                Read the Docs
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
