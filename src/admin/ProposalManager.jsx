import React, { useState } from 'react';
import { generateId } from '../data/demoData';

// Status badge color map
const STATUS_STYLES = {
  active: 'status-badge-active',
  draft: 'status-badge-draft',
  closed: 'status-badge-closed',
};

const STATUS_CYCLE = { draft: 'active', active: 'closed', closed: 'draft' };

export default function ProposalManager({ proposals, setProposals }) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // proposal id or 'new'
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filtered list
  const filtered = proposals.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // Open create form
  const handleNew = () => {
    setForm({ title: '', description: '', startDate: '', endDate: '' });
    setEditing('new');
  };

  // Open edit form
  const handleEdit = (proposal) => {
    setForm({
      title: proposal.title,
      description: proposal.description,
      startDate: proposal.startDate,
      endDate: proposal.endDate,
    });
    setEditing(proposal.id);
  };

  // Save (create or update)
  const handleSave = () => {
    if (!form.title.trim()) return;

    if (editing === 'new') {
      const newProposal = {
        id: generateId(),
        ...form,
        status: 'draft',
        candidates: [],
      };
      setProposals((prev) => [newProposal, ...prev]);
    } else {
      setProposals((prev) =>
        prev.map((p) => (p.id === editing ? { ...p, ...form } : p))
      );
    }
    setEditing(null);
  };

  // Delete proposal
  const handleDelete = (id) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
    setConfirmDelete(null);
  };

  // Toggle status
  const toggleStatus = (id) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: STATUS_CYCLE[p.status] || 'draft' } : p
      )
    );
  };

  // Compute total votes for a proposal
  const totalVotes = (p) => (p.candidates || []).reduce((s, c) => s + c.votes, 0);

  return (
    <div>
      {/* Toolbar */}
      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-search"
          placeholder="🔍  Search proposals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleNew}>
          + Add Proposal
        </button>
      </div>

      {/* Inline form (create / edit) */}
      {editing !== null && (
        <div className="admin-form-card">
          <h3 className="admin-form-title">
            {editing === 'new' ? 'Create Proposal' : 'Edit Proposal'}
          </h3>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Title</label>
              <input
                className="form-input"
                placeholder="Proposal title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="admin-form-group admin-form-full">
              <label>Description</label>
              <textarea
                className="form-input admin-textarea"
                placeholder="Describe the proposal…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="form-input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>End Date</label>
              <input
                type="date"
                className="form-input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              {editing === 'new' ? 'Create' : 'Save Changes'}
            </button>
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Proposal list */}
      <div className="admin-list">
        {filtered.length === 0 && (
          <div className="admin-empty">No proposals found.</div>
        )}
        {filtered.map((p) => (
          <div key={p.id} className="admin-card">
            <div className="admin-card-header">
              <div>
                <button
                  className={`status-badge ${STATUS_STYLES[p.status]}`}
                  onClick={() => toggleStatus(p.id)}
                  title="Click to change status"
                >
                  {p.status.toUpperCase()}
                </button>
                <h3 className="admin-card-title">{p.title}</h3>
              </div>
              <div className="admin-card-actions">
                <button className="admin-icon-btn" onClick={() => handleEdit(p)} title="Edit">
                  ✏️
                </button>
                {confirmDelete === p.id ? (
                  <>
                    <button className="admin-icon-btn admin-icon-danger" onClick={() => handleDelete(p.id)}>
                      Confirm
                    </button>
                    <button className="admin-icon-btn" onClick={() => setConfirmDelete(null)}>
                      ✗
                    </button>
                  </>
                ) : (
                  <button className="admin-icon-btn" onClick={() => setConfirmDelete(p.id)} title="Delete">
                    🗑️
                  </button>
                )}
              </div>
            </div>
            <p className="admin-card-desc">{p.description}</p>
            <div className="admin-card-meta">
              <span>📅 {p.startDate || '—'} → {p.endDate || '—'}</span>
              <span>👥 {(p.candidates || []).length} candidates</span>
              <span>🗳️ {totalVotes(p)} votes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
