import React, { useEffect, useState } from 'react';
import { Plus, Eye, Trash2, ShoppingCart, X } from 'lucide-react';
import { ordersApi, customersApi, productsApi } from '../api/client.js';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

function CreateOrderModal({ onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customer_id: '', notes: '', items: [] });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 1 });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    customersApi.list().then(r => setCustomers(r.data));
    productsApi.list().then(r => setProducts(r.data));
  }, []);

  const addItem = () => {
    if (!newItem.product_id || newItem.quantity < 1) { setError('Select a product and valid quantity.'); return; }
    const product = products.find(p => p.id === parseInt(newItem.product_id));
    const existing = form.items.find(i => i.product_id === parseInt(newItem.product_id));
    if (existing) { setError('Product already added. Edit quantity below.'); return; }
    if (parseInt(newItem.quantity) > product.stock_quantity) { setError(`Only ${product.stock_quantity} in stock.`); return; }
    setForm({ ...form, items: [...form.items, { product_id: parseInt(newItem.product_id), quantity: parseInt(newItem.quantity), product }] });
    setNewItem({ product_id: '', quantity: 1 });
    setError('');
  };

  const removeItem = (pid) => setForm({ ...form, items: form.items.filter(i => i.product_id !== pid) });

  const total = form.items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (!form.customer_id) { setError('Select a customer.'); return; }
    if (form.items.length === 0) { setError('Add at least one item.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        customer_id: parseInt(form.customer_id),
        notes: form.notes,
        items: form.items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      };
      await ordersApi.create(payload);
      onSaved('Order created successfully!');
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to create order.');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <h2>Create New Order</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Customer *</label>
            <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional order notes" />
          </div>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Add Items</div>
          <div className="form-row">
            <select value={newItem.product_id} onChange={e => setNewItem({ ...newItem, product_id: e.target.value })}>
              <option value="">Select product...</option>
              {products.filter(p => p.stock_quantity > 0).map(p => (
                <option key={p.id} value={p.id}>{p.name} — ${p.price} (stock: {p.stock_quantity})</option>
              ))}
            </select>
            <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} style={{ maxWidth: 80 }} />
          </div>
          <button className="btn-secondary btn-sm" onClick={addItem} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} /> Add Item</button>
        </div>

        {form.items.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <table>
              <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Sub</th><th></th></tr></thead>
              <tbody>
                {form.items.map(i => (
                  <tr key={i.product_id}>
                    <td style={{ fontSize: 13 }}>{i.product.name}</td>
                    <td style={{ fontSize: 13 }}>{i.quantity}</td>
                    <td style={{ fontSize: 13 }}>${i.product.price.toFixed(2)}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>${(i.product.price * i.quantity).toFixed(2)}</td>
                    <td><button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2 }} onClick={() => removeItem(i.product_id)}><X size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'right', marginTop: 12, fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
              Total: ${total.toFixed(2)}
            </div>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}
        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Creating...' : 'Place Order'}</button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ordersApi.get(orderId).then(r => setOrder(r.data));
  }, [orderId]);

  const handleStatusChange = async (status) => {
    setSaving(true);
    await ordersApi.update(orderId, { status });
    ordersApi.get(orderId).then(r => { setOrder(r.data); setSaving(false); });
  };

  if (!order) return <div className="modal-overlay"><div className="modal"><p style={{ color: 'var(--text2)' }}>Loading...</p></div></div>;

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Order #{order.id}</h2>
          <span className={`badge badge-${order.status}`}>{order.status}</span>
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>CUSTOMER</div>
          <div style={{ fontWeight: 600 }}>{order.customer.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{order.customer.email}</div>
        </div>

        <table style={{ marginBottom: 16 }}>
          <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
          <tbody>
            {order.order_items.map(i => (
              <tr key={i.id}>
                <td style={{ fontSize: 13 }}>{i.product.name}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)' }}>{i.product.sku}</td>
                <td style={{ fontSize: 13 }}>{i.quantity}</td>
                <td style={{ fontSize: 13 }}>${i.unit_price.toFixed(2)}</td>
                <td style={{ fontSize: 13, fontWeight: 600 }}>${(i.unit_price * i.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginBottom: 20 }}>
          Total: ${order.total_amount.toFixed(2)}
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Update Status</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statuses.map(s => (
              <button key={s} onClick={() => handleStatusChange(s)} disabled={saving || order.status === s}
                className={`badge badge-${s}`}
                style={{ cursor: order.status === s ? 'default' : 'pointer', border: order.status === s ? '2px solid currentColor' : '1px solid currentColor', padding: '5px 12px', opacity: saving ? 0.6 : 1 }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    ordersApi.list().then(r => { setOrders(r.data.reverse()); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this order? Stock will be restored.')) return;
    try {
      await ordersApi.delete(id);
      setToast({ msg: 'Order deleted. Stock restored.', type: 'success' });
      load();
    } catch (e) {
      setToast({ msg: e.response?.data?.detail || 'Delete failed.', type: 'error' });
    }
  };

  const handleSaved = (msg) => {
    setToast({ msg, type: 'success' });
    setShowCreate(false);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Orders</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 2 }}>Track and manage customer orders</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> New Order
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><ShoppingCart size={40} /><p>No orders yet.</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)' }}>#{o.id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.customer.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{o.customer.email}</div>
                  </td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td style={{ fontWeight: 600 }}>${o.total_amount.toFixed(2)}</td>
                  <td style={{ color: 'var(--text2)', fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-secondary btn-sm" onClick={() => setViewOrder(o.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> View</button>
                      <button className="btn-danger btn-sm" onClick={() => handleDelete(o.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trash2 size={12} /> Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {viewOrder && <OrderDetailModal orderId={viewOrder} onClose={() => { setViewOrder(null); load(); }} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
