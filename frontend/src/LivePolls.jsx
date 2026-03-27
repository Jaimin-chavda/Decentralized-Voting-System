import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProposals } from "./context/ProposalContext";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export default function LivePolls() {
  const { activeProposals, castVote, hasUserVoted } = useProposals();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [justVoted, setJustVoted] = useState(null);

  const poll = activeProposals[activeTab];

  const handleVote = (proposalId, candidateId) => {
    if (!isAuthenticated) return;
    castVote(proposalId, candidateId);
    setJustVoted(candidateId);
    setTimeout(() => setJustVoted(null), 800);
  };

  const totalVotes = poll
    ? poll.candidates.reduce((s, c) => s + c.votes, 0)
    : 0;
  const leadingId = poll
    ? poll.candidates.reduce((a, b) => (a.votes >= b.votes ? a : b)).id
    : null;
  const userAlreadyVoted =
    poll && isAuthenticated ? hasUserVoted(poll.id, user.email) : false;

  return (
    <section id="live-polls" className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-accent/[0.03] to-transparent pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            LIVE VOTING
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl font-bold text-text-primary mb-3"
          >
            Active <span className="gradient-text">Polls</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-text-muted max-w-md mx-auto"
          >
            Cast your vote on active governance proposals. Results update in
            real time.
          </motion.p>
        </motion.div>

        {/* Empty State */}
        {activeProposals.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🗳️</div>
            <p className="text-text-primary font-medium mb-2">
              No active polls right now
            </p>
            <p className="text-sm text-text-muted">
              Check back soon or create a proposal in the admin panel.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            {activeProposals.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
                {activeProposals.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 shrink-0 ${
                      i === activeTab
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20"
                        : "glass text-text-muted hover:text-text-primary hover:bg-white/[0.08]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        i === activeTab ? "bg-white" : "bg-success"
                      } animate-pulse`}
                    />
                    {p.title.length > 28 ? p.title.slice(0, 28) + "…" : p.title}
                  </button>
                ))}
              </div>
            )}

            {/* Poll Card */}
            <AnimatePresence mode="wait">
              {poll && (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-2xl overflow-hidden"
                >
                  {/* Poll Header */}
                  <div className="p-6 lg:p-8 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-success/10 text-success text-xs font-bold tracking-wide">
                            ACTIVE
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold">
                            ⏳ {poll.endDate || "3d left"}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">
                          {poll.title}
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                          {poll.description}
                        </p>
                      </div>
                      <div className="flex gap-4 shrink-0">
                        <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-white/5">
                          <span className="text-2xl font-extrabold text-text-primary">
                            {totalVotes}
                          </span>
                          <span className="text-[11px] text-text-muted uppercase tracking-wider">
                            Votes
                          </span>
                        </div>
                        <div className="flex flex-col items-center px-4 py-3 rounded-xl bg-white/5">
                          <span className="text-2xl font-extrabold text-text-primary">
                            {poll.candidates.length}
                          </span>
                          <span className="text-[11px] text-text-muted uppercase tracking-wider">
                            Options
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Candidates */}
                  <div className="p-6 lg:p-8 space-y-4">
                    {poll.candidates.map((c) => {
                      const pct =
                        totalVotes > 0
                          ? ((c.votes / totalVotes) * 100).toFixed(1)
                          : "0.0";
                      const isLeading = c.id === leadingId && totalVotes > 0;
                      const wasJustVoted = justVoted === c.id;

                      return (
                        <motion.div
                          key={c.id}
                          layout
                          className={`p-4 rounded-xl border transition-all duration-300 ${
                            isLeading
                              ? "bg-success/5 border-success/20"
                              : "bg-white/[0.02] border-white/5 hover:border-white/10"
                          } ${wasJustVoted ? "ring-2 ring-success/40" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                                  isLeading ? "bg-success/10" : "bg-primary/10"
                                }`}
                              >
                                👤
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
                                  <span className="truncate">{c.name}</span>
                                  {isLeading && (
                                    <span className="shrink-0 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded uppercase">
                                      Leading
                                    </span>
                                  )}
                                </div>
                                {c.party && (
                                  <div className="text-xs text-text-muted">
                                    {c.party}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs text-text-muted">
                                {c.votes} votes
                              </span>
                              <span className="text-lg font-extrabold text-text-primary min-w-[50px] text-right">
                                {pct}%
                              </span>
                            </div>
                          </div>
                          {/* Bar */}
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                isLeading
                                  ? "bg-gradient-to-r from-success/80 to-success"
                                  : "bg-gradient-to-r from-primary/60 to-primary"
                              }`}
                            />
                          </div>
                          {/* Vote button */}
                          {isAuthenticated && !userAlreadyVoted && (
                            <button
                              onClick={() => handleVote(poll.id, c.id)}
                              className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-md hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                              Vote for {c.name}
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-6 lg:px-8 pb-6">
                    {userAlreadyVoted ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/20 text-sm text-success font-medium">
                        <span className="text-lg">✅</span>
                        You've already voted on this proposal.
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-400">
                        <span>🔒</span>
                        <span>
                          <button
                            onClick={() => navigate("/login")}
                            className="font-bold underline hover:no-underline"
                          >
                            Login
                          </button>{" "}
                          or{" "}
                          <button
                            onClick={() => navigate("/signup")}
                            className="font-bold underline hover:no-underline"
                          >
                            Sign up
                          </button>{" "}
                          to cast your vote.
                        </span>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav Arrows */}
            {activeProposals.length > 1 && (
              <div className="flex items-center justify-center gap-5 mt-6">
                <button
                  disabled={activeTab === 0}
                  onClick={() => setActiveTab(activeTab - 1)}
                  className="px-4 py-2 text-sm glass rounded-xl text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                <span className="text-sm font-semibold text-text-muted">
                  {activeTab + 1} / {activeProposals.length}
                </span>
                <button
                  disabled={activeTab === activeProposals.length - 1}
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="px-4 py-2 text-sm glass rounded-xl text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
