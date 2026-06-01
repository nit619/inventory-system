import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Package, Users, ShoppingCart, BarChart3, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Customers from './pages/Customers.jsx';
import Orders from './pages/Orders.jsx';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: BarChart3, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  ];

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{
          width: 240,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 100,
          transform: sidebarOpen || window.innerWidth > 768 ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={18} color="#000" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>InvManager</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Inventory System</div>
              </div>
            </div>
          </div>
          <nav style={{ padding: '16px 12px', flex: 1 }}>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  textDecoration: 'none', marginBottom: 4,
                  fontSize: 14, fontWeight: 500,
                  color: isActive ? 'var(--accent)' : 'var(--text2)',
                  background: isActive ? 'rgba(0,212,170,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                })}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)' }}>
            v1.0.0 · Assessment Build
          </div>
        </aside>

        {/* Main content */}
        <main style={{ marginLeft: 240, flex: 1, minWidth: 0 }}>
          {/* Top bar for mobile */}
          <div style={{ display: 'none', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', alignItems: 'center', gap: 12 }} className="mobile-topbar">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text)', padding: 4 }}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span style={{ fontWeight: 600 }}>InvManager</span>
          </div>

          <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
