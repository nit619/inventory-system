import React, { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { productsApi, customersApi, ordersApi } from '../api/client.js';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productsApi.list(), customersApi.list(), ordersApi.list()])
      .then(([p, c, o]) => {
        const products = p.data;
        const customers = c.data;
        const orders = o.data;
        const revenue = orders.reduce((sum, ord) => sum + ord.total_amount, 0);
        setStats({ products: products.length, customers: customers.length, orders: orders.length, revenue });
        setLowStock(products.filter(p => p.stock_quantity <= 5).slice(0, 5));
        setRecentOrders(orders.slice(-5).reverse());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'var(--accent)' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'var(--accent2)' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'var(--warn)' },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: TrendingUp, color: 'var(--success)' },
  ];

  if (loading) return <div style={{ color: 'var(--text2)', padding: 40 }}>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Inventory & Order Management Overview</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
              </div>
              <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}>
                <Icon size={22} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Low Stock */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={16} color="var(--warn)" />
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Low Stock Alert</h2>
          </div>
          {lowStock.length === 0
            ? <p style={{ color: 'var(--text2)', fontSize: 13 }}>All products have healthy stock levels.</p>
            : lowStock.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{p.sku}</div>
                </div>
                <span style={{ background: p.stock_quantity === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: p.stock_quantity === 0 ? 'var(--danger)' : 'var(--warn)', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  {p.stock_quantity} left
                </span>
              </div>
            ))
          }
        </div>

        {/* Recent Orders */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Recent Orders</h2>
          {recentOrders.length === 0
            ? <p style={{ color: 'var(--text2)', fontSize: 13 }}>No orders yet.</p>
            : recentOrders.map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Order #{o.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{o.customer?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>${o.total_amount.toFixed(2)}</div>
                  <span className={`badge badge-${o.status}`}>{o.status}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
