import { useEffect } from 'react';
import { initializeLegacyDashboard } from './legacy-dashboard.js';
import './App.css';

function Sidebar() {
  return (
    <aside className="sidebar">
  <div className="brand"><div className="brand-mark">≋</div><span className="brand-word">Pristine</span></div>
  <div className="nav-label">Workspace</div>
  <nav className="nav">
    <button className="active" data-view="dashboard"><span className="ico">▦</span><span className="nav-text">Dashboard</span></button>
    <button data-view="orders"><span className="ico">▤</span><span className="nav-text">Orders & Records</span></button>
    <button data-view="customers"><span className="ico">♙</span><span className="nav-text">Customers</span></button>
    <button data-view="reports"><span className="ico">▥</span><span className="nav-text">Business Metrics</span></button>
  </nav>
  <div className="sidebar-foot">LAUNDRY MANAGEMENT<br /><span style={{ opacity: 0.7 }}>Simple records. Clear insights.</span></div>
</aside>
  );
}

function MainContent() {
  return (
    <main className="main">
  <header className="topbar">
    <div><div className="eyebrow" id="greeting">LAUNDRY OVERVIEW</div><h1 id="page-title">Dashboard overview</h1></div>
    <div className="top-actions"><div className="date-chip" id="today-date"></div><div className="user-chip"><div className="avatar" id="user-avatar">OW</div><span className="user-name" id="user-name">Owner account</span></div><button className="btn btn-light" id="signout-btn" hidden>Sign out</button><button className="btn btn-primary" id="add-order-top"><span>＋</span> New order</button></div>
  </header>
  <div className="connection-banner" id="connection-banner" role="status"><span className="connection-dot"></span><div id="connection-message">Supabase is not configured. Records are currently stored in this browser only.</div></div>
  <section className="metrics">
    <article className="metric"><div className="metric-top">Revenue collected <span className="metric-icon ic-blue">↗</span></div><div className="metric-value" id="metric-revenue">KES 0</div><div className="metric-note"><span className="positive" id="revenue-count">0 payments</span> recorded in total</div></article>
    <article className="metric"><div className="metric-top">Orders received <span className="metric-icon ic-teal">▤</span></div><div className="metric-value" id="metric-orders">0</div><div className="metric-note"><span className="positive" id="active-count">0 active</span> in the workflow</div></article>
    <article className="metric"><div className="metric-top">Awaiting collection <span className="metric-icon ic-orange">◷</span></div><div className="metric-value" id="metric-ready">0</div><div className="metric-note">Ready for customer pickup</div></article>
    <article className="metric"><div className="metric-top">Customers <span className="metric-icon ic-purple">♙</span></div><div className="metric-value" id="metric-customers">0</div><div className="metric-note">Unique customers on record</div></article>
  </section>
  <section className="content-grid">
    <article className="panel">
      <div className="panel-head"><div><div className="panel-title">Revenue overview</div><div className="panel-sub">Paid order revenue over the last 7 days</div></div><select className="period-select" id="chart-period"><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option></select></div>
      <div className="chart-wrap"><svg className="chart" id="revenue-chart" viewBox="0 0 620 220" preserveAspectRatio="none" aria-label="Revenue chart"></svg></div>
    </article>
  </section>
  <section className="panel table-panel" id="orders-panel">
    <div className="panel-head"><div><div className="panel-title" id="table-title">Recent orders</div><div className="panel-sub" id="table-sub">Track every item from drop-off to collection</div></div><div className="table-tools"><input className="search" id="search" placeholder="Search customer, phone or order ID…" aria-label="Search orders" /><button className="btn btn-light" id="export-btn">↓ Export CSV</button></div></div>
    <div className="table-scroll"><table><thead><tr><th>Order / Customer</th><th>Service</th><th>Date received</th><th>Due date</th><th>Status</th><th>Amount</th><th>Payment</th><th>Update</th></tr></thead><tbody id="orders-body"></tbody></table></div>
    <div className="table-footer"><span id="table-count">0 records</span><span id="storage-label">Stored in this browser</span></div>
  </section>
  <section className="lower-grid" style={{ marginTop: 22 }}>
    <article className="panel"><div className="panel-head"><div><div className="panel-title">Quick actions</div><div className="panel-sub">Common tasks for your business</div></div></div><div className="quick-actions">
      <button className="quick-action" id="quick-add"><span>＋</span><strong>Record new order</strong><small>Add a customer and service</small></button>
      <button className="quick-action" id="quick-customer"><span>♙</span><strong>View customers</strong><small>Search your customer records</small></button>
      <button className="quick-action" id="quick-export"><span>⇩</span><strong>Export records</strong><small>Download a CSV backup</small></button>
      <button className="quick-action" id="quick-metrics"><span>▥</span><strong>Business metrics</strong><small>Review revenue and orders</small></button>
    </div></article>
    <article className="panel"><div className="panel-head"><div><div className="panel-title">Recent activity</div><div className="panel-sub">Latest changes to your records</div></div></div><div className="activity-list" id="activity-list"></div></article>
  </section>
  <p style={{ textAlign: 'center', color: '#98a4b3', fontSize: 10, margin: '25px 0 0' }}>Pristine Admin · Keep your records up to date · Currency: KES</p>
</main>
  );
}

function RightPanel() {
  return (
    <aside className="right-panel">
  <section className="owner-card ai-card">
    <div className="owner-photo ai-avatar">✦</div>
    <h2>Pristine AI</h2>
    <p>Business learning assistant</p>
    <div className="ai-learning"><span className="ai-live-dot"></span> Learns from every update</div>
    <div className="owner-actions">
      <button type="button" title="Ask for a business insight" id="owner-contact">✧</button>
      <button type="button" title="Record a new order" id="owner-add">＋</button>
      <button type="button" title="Export records" id="owner-export">⋮</button>
    </div>
  </section>
  <div className="activity-heading"><span></span><strong>What I'm learning</strong><span></span></div>
  <div className="right-activity" id="right-activity"></div>
  <div className="right-tip"><strong>✦ AI business insight</strong><p id="ai-insight">Add your first order and I’ll start building a picture of your laundromat’s services, customers, payments, and workflow.</p></div>
</aside>
  );
}

function OrderModal() {
  return (
    <div className="modal-backdrop" id="order-modal">
  <form className="modal" id="order-form">
    <div className="modal-head"><div><h2>Record a new order</h2><div className="panel-sub">Enter the customer's order details below.</div></div><button type="button" className="close" id="close-modal" aria-label="Close">×</button></div>
    <div className="form-grid">
      <div className="field"><label htmlFor="customer-name">Customer name *</label><input id="customer-name" required placeholder="e.g. Mary Wanjiku" /></div>
      <div className="field"><label htmlFor="customer-phone">Phone number *</label><input id="customer-phone" required placeholder="e.g. 0712 345 678" /></div>
      <div className="field"><label id="service-label">Service *</label><div className="ms" id="service-dd"><button type="button" className="ms-btn" id="service-btn" aria-haspopup="true" aria-expanded="false"><span id="service-summary" className="placeholder">Select services</span><span className="caret">▾</span></button><div className="chips" id="service-chips" role="group" aria-labelledby="service-label" hidden><label className="chip"><input type="checkbox" name="service" value="Wash & Fold" /><span>Wash & Fold</span></label><label className="chip"><input type="checkbox" name="service" value="Dry Cleaning" /><span>Dry Cleaning</span></label><label className="chip"><input type="checkbox" name="service" value="Ironing" /><span>Ironing</span></label><label className="chip"><input type="checkbox" name="service" value="Bedding & Duvets" /><span>Bedding & Duvets</span></label><label className="chip"><input type="checkbox" name="service" value="Wash Only" /><span>Wash Only</span></label><label className="chip"><input type="checkbox" name="service" value="Other" /><span>Other</span></label></div></div><input id="service-other" placeholder="Specify other service" style={{display:'none'}} /><div className="field-error" id="service-error">Please select at least one service.</div></div>
      <div className="field"><label htmlFor="amount">Amount (KES) *</label><input id="amount" type="number" min="0" step="1" required placeholder="e.g. 850" /></div>
      <div className="field"><label htmlFor="received-date">Date received *</label><input id="received-date" type="date" required /></div>
      <div className="field"><label htmlFor="due-date">Expected collection *</label><input id="due-date" type="date" required /></div>
      <div className="field"><label htmlFor="order-status">Order status</label><select id="order-status"><option>Received</option><option>Washing</option><option>Ready for pickup</option><option>Delivered</option></select></div>
      <div className="field"><label htmlFor="payment-status">Payment status</label><select id="payment-status"><option>Paid</option><option>Unpaid</option><option>Partial</option></select></div>
      <div className="field full"><label htmlFor="order-notes">Notes (optional)</label><input id="order-notes" placeholder="Special instructions, item count, etc." /></div>
    </div>
    <div className="modal-foot"><button type="button" className="btn btn-light" id="cancel-modal">Cancel</button><button type="submit" className="btn btn-primary">Save order</button></div>
  </form>
</div>
  );
}

function AuthGate() {
  return (
    <div className="auth-gate" id="auth-gate" aria-modal="true" role="dialog" aria-labelledby="auth-title">
  <form className="auth-card" id="auth-form">
    <div className="auth-brand"><span className="auth-brand-mark">≋</span><span>Pristine</span></div>
    <h2 id="auth-title">Staff sign in</h2>
    <p>Sign in with a staff account to access Pristine's shared laundry records.</p>
    <div className="auth-fields">
      <label>Email address<input type="email" id="auth-email" autoComplete="username" required placeholder="you@business.com" /></label>
      <label>Password<input type="password" id="auth-password" autoComplete="current-password" required placeholder="Enter your password" /></label>
    </div>
    <button className="btn btn-primary" id="auth-submit" type="submit">Sign in securely</button>
    <div className="auth-error" id="auth-error" role="alert"></div>
    <div className="auth-help">Staff accounts are created by the Supabase project administrator. Public sign-ups should remain disabled.</div>
  </form>
</div>
  );
}

export default function App() {
  useEffect(() => {
    initializeLegacyDashboard();
  }, []);

  return (
    <>
      <div className="app">
        <Sidebar />
        <MainContent />
        <RightPanel />
      </div>
      <OrderModal />
      <AuthGate />
      <div className="notice" id="notice" role="status"></div>
    </>
  );
}