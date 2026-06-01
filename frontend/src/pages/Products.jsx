import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { productsApi } from '../api/client.js';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

function ProductModal({ product, onClose, onSaved }) {
  const editing = !!product?.id;
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    price: product?.price || '',
    stock_quantity: product?.stock_quantity ?? 0,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.price) { setError('Name, SKU and Price are required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) };
      if (editing) await productsApi.update(product.id, payload);
      else await productsApi.create(payload);
      onSaved(editing ? 'Product updated!' : 'Product created!');
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save product.');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Product Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Mouse" />
          </div>
          <div className="form-group">
            <label>SKU *</label>
            <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WM-001" disabled={editing} style={editing ? { opacity: 0.6 } : {}} />
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional description" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (USD) *</label>
            <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" />
          </div>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product obj
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    productsApi.list().then(r => { setProducts(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productsApi.delete(id);
      setToast({ msg: 'Product deleted.', type: 'success' });
      load();
    } catch (e) {
      setToast({ msg: e.response?.data?.detail || 'Delete failed.', type: 'error' });
    }
  };

  const handleSaved = (msg) => {
    setToast({ msg, type: 'success' });
    setModal(null);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Products</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 2 }}>Manage your product catalog and inventory</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state"><Package size={40} /><p>No products yet. Add your first product.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{p.description.slice(0, 50)}{p.description.length > 50 ? '...' : ''}</div>}
                  </td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', background: 'rgba(0,212,170,0.08)', padding: '2px 8px', borderRadius: 4 }}>{p.sku}</span></td>
                  <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                  <td>
                    <span style={{ color: p.stock_quantity === 0 ? 'var(--danger)' : p.stock_quantity <= 5 ? 'var(--warn)' : 'var(--success)', fontWeight: 600 }}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-secondary btn-sm" onClick={() => setModal(p)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Pencil size={12} /> Edit</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={12} /> Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && <ProductModal product={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSaved={handleSaved} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
