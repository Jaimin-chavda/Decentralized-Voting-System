import React, { useState } from 'react';
import { generateId } from '../data/demoData';

// Emoji avatar options for quick selection
const AVATARS = ['👤', '👩', '🧑', '👩‍💻', '👨‍💼', '🧑‍🔬', '👷', '🦸'];

export default function CandidateManager({ proposals, setProposals }) {
  const [selectedProposalId, setSelectedProposalId] = useState(
    proposals.length > 0 ? proposals[0].id : ''
  );
  const [editing, setEditing] = useState(null); // candidate id or 'new'
  const [form, setForm] = useState({ name: '', party: '', avatar: '👤' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Currently selected proposal
  const selectedProposal = proposals.find((p) => p.id === selectedProposalId);
  const candidates = selectedProposal?.candidates || [];

  // Open create form
  const handleNew = () => {
    setForm({ name: '', party: '', avatar: '👤' });
    setEditing('new');
  };

  // Open edit form
  const handleEdit = (candidate) => {
    setForm({ name: candidate.name, party: candidate.party, avatar: candidate.avatar });
    setEditing(candidate.id);
  };

  // Save (create or update)
  const handleSave = () => {
    if (!form.name.trim()) return;

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProposalId) return p;

        if (editing === 'new') {
          return {
            ...p,
            candidates: [
              ...p.candidates,
              { id: generateId(), name: form.name, party: form.party, avatar: form.avatar, votes: 0 },
            ],
          };
        }
        return {
          ...p,
          candidates: p.candidates.map((c) =>
            c.id === editing ? { ...c, name: form.name, party: form.party, avatar: form.avatar } : c
          ),
        };
      })
    );
    setEditing(null);
  };

  // Delete candidate
  const handleDelete = (candidateId) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProposalId) return p;
        return { ...p, candidates: p.candidates.filter((c) => c.id !== candidateId) };
      })
    );
    setConfirmDelete(null);
  };

  return (
    <div>
      {/* Proposal selector */}
      <div className="admin-toolbar">
        <div className="admin-select-wrapper">
          <label className="admin-select-label">Proposal:</label>
          <select
            className="admin-select"
            value={selectedProposalId}
            onChange={(e) => {
              setSelectedProposalId(e.target.value);
              setEditing(null);
            }}
          >
            {proposals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.status})
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleNew} disabled={!selectedProposal}>
          + Add Candidate
        </button>
      </div>

      {!selectedProposal && (
        <div className="admin-empty">Select a proposal to manage its candidates.</div>
      )}

      {/* Inline form */}
      {editing !== null && selectedProposal && (
        <div className="admin-form-card">
          <h3 className="admin-form-title">
            {editing === 'new' ? 'Add Candidate' : 'Edit Candidate'}
          </h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Name</label>
              <input
                className="form-input"
                placeholder="Candidate name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>Party / Faction</label>
              <input
                className="form-input"
                placeholder="Party name"
                value={form.party}
                onChange={(e) => setForm({ ...form, party: e.target.value })}
              />
            </div>
            <div className="admin-form-group admin-form-full">
              <label>Avatar</label>
              <div className="avatar-picker">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`avatar-option ${form.avatar === a ? 'avatar-selected' : ''}`}
                    onClick={() => setForm({ ...form, avatar: a })}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              {editing === 'new' ? 'Add' : 'Save Changes'}
            </button>
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Candidate cards */}
      {selectedProposal && (
        <div className="candidate-grid">
          {candidates.length === 0 && (
            <div className="admin-empty" style={{ gridColumn: '1 / -1' }}>
              No candidates yet. Click "Add Candidate" to create one.
            </div>
          )}
          {candidates.map((c) => (
            <div key={c.id} className="candidate-card">
              <div className="candidate-avatar">{c.avatar}</div>
              <h4 className="candidate-name">{c.name}</h4>
              <span className="candidate-party">{c.party}</span>
              <div className="candidate-votes">🗳️ {c.votes} votes</div>
              <div className="candidate-actions">
                <button className="admin-icon-btn" onClick={() => handleEdit(c)} title="Edit">
                  ✏️
                </button>
                {confirmDelete === c.id ? (
                  <>
                    <button className="admin-icon-btn admin-icon-danger" onClick={() => handleDelete(c.id)}>
                      Yes
                    </button>
                    <button className="admin-icon-btn" onClick={() => setConfirmDelete(null)}>
                      ✗
                    </button>
                  </>
                ) : (
                  <button className="admin-icon-btn" onClick={() => setConfirmDelete(c.id)} title="Delete">
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
