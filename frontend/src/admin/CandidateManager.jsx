import React, { useState } from "react";
import { generateId } from "../data/demoData";

// Emoji avatar options for quick selection
const AVATARS = ["👤", "👩", "🧑", "👩‍💻", "👨‍💼", "🧑‍🔬", "👷", "🦸"];

export default function CandidateManager({ proposals, updateProposal }) {
  const [selectedProposalId, setSelectedProposalId] = useState(
    proposals.length > 0 ? proposals[0].id : ""
  );
  const [editing, setEditing] = useState(null); // candidate id or 'new'
  const [form, setForm] = useState({ name: "", party: "", avatar: "👤" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Currently selected proposal
  const selectedProposal = proposals.find((p) => p.id === selectedProposalId);
  const candidates = selectedProposal?.candidates || [];

  // Open create form
  const handleNew = () => {
    setForm({ name: "", party: "", avatar: "👤" });
    setEditing("new");
  };

  // Open edit form
  const handleEdit = (candidate) => {
    setForm({
      name: candidate.name,
      party: candidate.party,
      avatar: candidate.avatar,
    });
    setEditing(candidate.id);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name.trim() || !selectedProposal) return;
    
    let newCandidates;
    if (editing === "new") {
      newCandidates = [
        ...selectedProposal.candidates,
        {
          name: form.name,
          party: form.party,
          avatar: form.avatar,
          votes: 0,
        },
      ];
    } else {
      newCandidates = selectedProposal.candidates.map((c) =>
        c.id === editing
          ? {
              ...c,
              name: form.name,
              party: form.party,
              avatar: form.avatar,
            }
          : c
      );
    }
    
    await updateProposal(selectedProposal.id, { candidates: newCandidates });
    setEditing(null);
  };

  // Delete candidate
  const handleDelete = async (candidateId) => {
    if (!selectedProposal) return;
    
    const newCandidates = selectedProposal.candidates.filter(c => c.id !== candidateId);
    await updateProposal(selectedProposal.id, { candidates: newCandidates });
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Proposal selector toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="w-full sm:max-w-md relative">
          <label className="absolute -top-2 left-3 px-1 bg-bg-dark text-xs font-semibold text-primary rounded">
            Select Proposal
          </label>
          <select
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            value={selectedProposalId}
            onChange={(e) => {
              setSelectedProposalId(e.target.value);
              setEditing(null);
            }}
          >
            {proposals.map((p) => (
              <option key={p.id} value={p.id} className="bg-bg-dark text-text-primary">
                {p.title} ({p.status})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            ▼
          </div>
        </div>

        <button
          className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shrink-0"
          onClick={handleNew}
          disabled={!selectedProposal}
        >
          + Add Candidate
        </button>
      </div>

      {!selectedProposal && (
        <div className="text-center py-12 glass rounded-2xl flex flex-col items-center justify-center opacity-70">
          <span className="text-4xl mb-3">🔍</span>
          <p className="text-text-muted font-medium">
            Select a proposal to manage its candidates.
          </p>
        </div>
      )}

      {/* Inline form */}
      {editing !== null && selectedProposal && (
        <div className="glass rounded-2xl p-6 border border-primary/20 shadow-xl shadow-black/20 relative overflow-hidden mt-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
          <h3 className="text-xl font-bold text-text-primary mb-6">
            {editing === "new" ? "Add Candidate" : "Edit Candidate"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">
                Candidate Name
              </label>
              <input
                className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                placeholder="E.g., Alice Vance"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">
                Party / Faction
              </label>
              <input
                className="w-full px-4 py-2.5 bg-black/20 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Independent"
                value={form.party}
                onChange={(e) => setForm({ ...form, party: e.target.value })}
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-medium text-text-muted">
                Avatar Selection
              </label>
              <div className="flex flex-wrap gap-3">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                      form.avatar === a
                        ? "bg-primary/20 border-2 border-primary scale-110 shadow-lg shadow-primary/20"
                        : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                    onClick={() => setForm({ ...form, avatar: a })}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 border-t border-border pt-6">
            <button
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all"
              onClick={handleSave}
            >
              {editing === "new" ? "Add" : "Save Changes"}
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

      {/* Candidate cards */}
      {selectedProposal && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
          {candidates.length === 0 && (
            <div className="col-span-full text-center py-12 glass rounded-2xl flex flex-col items-center justify-center opacity-70">
              <span className="text-4xl mb-3">👻</span>
              <p className="text-text-muted font-medium">
                No candidates yet. Click "Add Candidate" to create one.
              </p>
            </div>
          )}
          {candidates.map((c) => (
            <div
              key={c.id}
              className="glass rounded-2xl p-6 flex flex-col items-center text-center border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all relative group"
            >
              <div className="w-20 h-20 rounded-full bg-black/20 border border-white/5 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                {c.avatar}
              </div>
              <h4 className="text-lg font-bold text-text-primary mb-1">
                {c.name}
              </h4>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted px-3 py-1 bg-white/5 rounded-full mb-4">
                {c.party || "No Party"}
              </span>
              <div className="w-full bg-white/5 border border-white/10 rounded-xl py-2 font-semibold text-text-primary mt-auto">
                🗳️ {c.votes} {c.votes === 1 ? "Vote" : "Votes"}
              </div>

              {/* Hover overlay actions */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                <button
                  className="w-12 h-12 rounded-full bg-white text-black hover:bg-primary hover:text-white flex items-center justify-center text-xl transition-all shadow-xl"
                  onClick={() => handleEdit(c)}
                  title="Edit"
                >
                  ✏️
                </button>
                {confirmDelete === c.id ? (
                  <div className="flex bg-danger p-1 rounded-full shadow-xl">
                    <button
                      className="px-4 py-2 font-bold text-white uppercase text-xs hover:bg-black/20 rounded-full transition-colors"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-white bg-black/20 rounded-full hover:bg-black/40"
                      onClick={() => setConfirmDelete(null)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-12 h-12 rounded-full bg-danger text-white hover:bg-red-600 flex items-center justify-center text-xl transition-all shadow-xl"
                    onClick={() => setConfirmDelete(c.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
