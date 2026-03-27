import React, { useState } from "react";
import { generateId } from "../data/demoData";

const STATUS_STYLES = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  draft: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  closed: "bg-danger/10 text-danger border-danger/20",
};

const STATUS_CYCLE = { draft: "active", active: "closed", closed: "draft" };

export default function ProposalManager({ proposals, addProposal, updateProposal, deleteProposal }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // proposal id or 'new'
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    initialCandidates: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filtered list
  const filtered = proposals.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // Open create form
  const handleNew = () => {
    setForm({ title: "", description: "", startDate: "", endDate: "", initialCandidates: "" });
    setEditing("new");
  };

  // Open edit form
  const handleEdit = (proposal) => {
    setForm({
      title: proposal.title,
      description: proposal.description,
      startDate: proposal.startDate,
      endDate: proposal.endDate,
      initialCandidates: (proposal.candidates || []).map(c => c.name).join(", "),
    });
    setEditing(proposal.id);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.title.trim()) return;

    if (editing === "new") {
      const candidateNames = form.initialCandidates
        ? form.initialCandidates.split(",").map((n) => n.trim()).filter((n) => n)
        : [];
      await addProposal({
        ...form,
        status: "draft",
        candidates: candidateNames,
      });
    } else {
      // For updates, we manage candidates in the other tab or we could parse here too
      // But let's keep it simple for now as per plan
      await updateProposal(editing, { ...form });
    }
    setEditing(null);
  };

  // Delete proposal
  const handleDelete = async (id) => {
    await deleteProposal(id);
    setConfirmDelete(null);
  };

  // Toggle status
  const toggleStatus = async (id) => {
    const proposal = proposals.find(p => p.id === id);
    if (!proposal) return;
    await updateProposal(id, { status: STATUS_CYCLE[proposal.status] || "draft" });
  };

  // Compute total votes for a proposal
  const totalVotes = (p) =>
    (p.candidates || []).reduce((s, c) => s + c.votes, 0);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/5 p-4 rounded-2xl border border-white/5">
        <input
          type="text"
          className="w-full sm:max-w-sm px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          placeholder="🔍 Search proposals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
          onClick={handleNew}
        >
          + Add Proposal
        </button>
      </div>

      {/* Inline form (create / edit) */}
      {editing !== null && (
        <div className="glass rounded-2xl p-6 border border-primary/20 shadow-xl shadow-black/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <h3 className="text-xl font-bold text-text-primary mb-6">
            {editing === "new" ? "Create Proposal" : "Edit Proposal"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Title</label>
              <input
                className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Proposal title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-muted">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary/50 transition-all min-h-[100px] resize-y"
                placeholder="Describe the proposal…"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Start Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">End Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            {editing === "new" && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-text-muted">
                  Initial Candidates (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-black/20 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary/50 transition-all min-h-[80px] resize-y"
                  placeholder="Enter candidate names separated by commas (e.g. Alice, Bob, Charlie)"
                  value={form.initialCandidates}
                  onChange={(e) =>
                    setForm({ ...form, initialCandidates: e.target.value })
                  }
                />
                <p className="text-[10px] text-text-muted italic">
                  * You can also add/edit candidates later in the "Manage Candidates" tab.
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-4 border-t border-border pt-6">
            <button
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
              onClick={handleSave}
            >
              {editing === "new" ? "Create" : "Save Changes"}
            </button>
            <button
              className="px-6 py-2.5 bg-white/10 text-text-primary font-semibold rounded-xl hover:bg-white/20 transition-all"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Proposal list */}
      <div className="grid gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-12 glass rounded-2xl flex flex-col items-center justify-center opacity-70">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-text-muted font-medium">No proposals found.</p>
          </div>
        )}
        {filtered.map((p) => (
          <div
            key={p.id}
            className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all flex flex-col gap-4 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded border ${
                    STATUS_STYLES[p.status]
                  } hover:scale-105 active:scale-95 transition-all mt-1`}
                  onClick={() => toggleStatus(p.id)}
                  title="Click to toggle status"
                >
                  {p.status}
                </button>
                <h3 className="text-lg font-bold text-text-primary leading-snug">
                  {p.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                <button
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg transition-all"
                  onClick={() => handleEdit(p)}
                  title="Edit"
                >
                  ✏️
                </button>
                {confirmDelete === p.id ? (
                  <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl p-1">
                    <button
                      className="px-3 py-1.5 text-xs font-bold text-white bg-danger rounded-lg hover:bg-red-600 transition-all"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-white"
                      onClick={() => setConfirmDelete(null)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-10 h-10 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white flex items-center justify-center text-lg transition-all"
                    onClick={() => setConfirmDelete(p.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
              {p.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-text-muted pt-2 border-t border-border">
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                📅 {p.startDate || "—"} → {p.endDate || "—"}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                👥 {(p.candidates || []).length} Candidates
              </span>
              <span className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md">
                🗳️ {totalVotes(p)} Votes
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
