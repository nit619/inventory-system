import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { customersApi } from '../api/client.js';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

function CustomerModal({ customer, onClose, onSaved }) {
  const editing = !!customer?.id;
  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Name and Email are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editing) await customersApi.update(customer.id, form);
      else await customersApi.create(form);
      onSaved(editing ? 'Customer updated!' : 'Customer created!');
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save customer.');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{editing ? 'Edit Customer' : 'Add New Customer'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St..." />
          </div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save Customer'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    customersApi.list().then(r => { setCustomers(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete customer "${name}"?`)) return;
    try {
      await customersApi.delete(id);
      setToast({ msg: 'Customer deleted.', type: 'success' });
      load();
    } catch (e) {
      setToast({ msg: e.response?.data?.detail || 'Delete failed.', type: 'error' });
    }
  };

  const handleSaved = (msg) => { setToast({ msg, type: 'success' }); setModal(null); load(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Customers</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 2 }}>Manage your customer directory</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state"><Users size={40} /><p>No customers yet.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: 'var(--accent)', fontSize: 13 }}>{c.email}</td>
                  <td style={{ color: 'var(--text2)', fontSize: 13 }}>{c.phone || '—'}</td>
                  <td style={{ color: 'var(--text2)', fontSize: 13 }}>{c.address ? c.address.slice(0, 30) + (c.address.length > 30 ? '...' : '') : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-secondary btn-sm" onClick={() => setModal(c)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Pencil size={12} /> Edit</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={12} /> Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && <CustomerModal customer={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
