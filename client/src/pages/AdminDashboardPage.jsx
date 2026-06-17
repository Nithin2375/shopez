import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const makeImage = (title, color, accent) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${color}"/>
          <stop offset="1" stop-color="#0f1728"/>
        </linearGradient>
      </defs>
      <rect width="900" height="620" fill="url(#bg)"/>
      <circle cx="710" cy="105" r="120" fill="${accent}" opacity="0.25"/>
      <circle cx="190" cy="500" r="155" fill="${accent}" opacity="0.18"/>
      <rect x="230" y="150" width="440" height="300" rx="34" fill="#ffffff" opacity="0.92"/>
      <rect x="275" y="195" width="350" height="190" rx="24" fill="${accent}" opacity="0.22"/>
      <text x="450" y="315" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#0f1728">${title}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const PRESETS = [
  { name: 'Turquoise Glow', bg: '#0d9488', accent: '#38bdf8' },
  { name: 'Sunset Rose', bg: '#be123c', accent: '#fb7185' },
  { name: 'Forest Emerald', bg: '#14532d', accent: '#4ade80' },
  { name: 'Royal Indigo', bg: '#3730a3', accent: '#818cf8' },
  { name: 'Charcoal Cyber', bg: '#334155', accent: '#22d3ee' },
  { name: 'Tangerine Wave', bg: '#c2410c', accent: '#fdba74' },
];

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (authLoading) {
    return (
      <main className="page">
        <div className="container spinner-container">
          <div className="spinner" />
          <p className="muted">Verifying credentials...</p>
        </div>
      </main>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <Navigate to="/products" replace />;
  }

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals & Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    imageUrl: '',
  });

  const [filterText, setFilterText] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch initial dashboard stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch users/customers
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchStats(),
        fetchProducts(),
        fetchOrders(),
        fetchCategories(),
        fetchUsers()
      ]);
    } catch (err) {
      setError('Error loading administration data. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show status success message and fade out
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Product Form Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      stock: '',
      category: categories[0] || 'Groceries',
      imageUrl: '',
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      stock: prod.stock,
      category: prod.category,
      imageUrl: prod.images?.[0]?.url || '',
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this product?')) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        triggerSuccess('Product deactivated successfully.');
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setError('');

    const priceNum = Number(productForm.price);
    const origPriceNum = productForm.originalPrice ? Number(productForm.originalPrice) : priceNum;
    const discountPercent = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent,
      stock: Number(productForm.stock),
      category: productForm.category,
      images: [{ url: productForm.imageUrl, altText: productForm.name }],
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        triggerSuccess('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        triggerSuccess('Product created successfully!');
      }
      setShowProductModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product details.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setError('');
    try {
      const res = await api.post('/admin/categories', { category: newCategoryName });
      if (res.data.success) {
        triggerSuccess('Category created successfully!');
        setNewCategoryName('');
        loadData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  // Order Status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        triggerSuccess(`Order status updated to '${newStatus}'`);
        loadData();
      }
    } catch (err) {
      setError('Failed to update order status.');
    }
  };

  // Category deletion
  const handleDeleteCategory = async (catName) => {
    if (!window.confirm(`Warning: Deleting category "${catName}" will deactivate all products in this category. Continue?`)) return;
    try {
      const res = await api.delete(`/products/categories/${encodeURIComponent(catName)}`);
      if (res.data.success) {
        triggerSuccess(`Category "${catName}" and all associated products deactivated.`);
        loadData();
      }
    } catch (err) {
      setError('Failed to delete category.');
    }
  };

  // Filters
  const filteredProducts = products.filter(p => 
    (p.name?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (p.category?.toLowerCase() || '').includes(filterText.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    (o._id?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (o.user?.name?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (o.orderStatus?.toLowerCase() || '').includes(filterText.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
    (u.phone?.toLowerCase() || '').includes(filterText.toLowerCase())
  );

  if (loading && stats.totalProducts === 0) {
    return (
      <main className="page">
        <div className="container spinner-container">
          <div className="spinner" />
          <p className="muted">Loading Admin Portal...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(18,183,213,0.05) 0%, transparent 70%)' }}>
      <div className="container" style={{ padding: '36px 0 70px' }}>
        
        {/* Alerts */}
        {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>⚠️ {error}</div>}
        {successMsg && <div className="alert alert-success" style={{ marginBottom: 24, animation: 'fadeIn 0.3s ease-in' }}>svg {successMsg}</div>}

        {/* Dashboard Header */}
        <div className="panel" style={{ padding: 28, marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: 140, height: 140, borderRadius: '50%', background: 'var(--primary)', opacity: 0.08, filter: 'blur(20px)' }} />
          <span className="tag">Portal</span>
          <h1 style={{ margin: '16px 0 8px', fontSize: '2.2rem', fontWeight: 900 }}>ShopEZ Control Panel</h1>
          <p className="muted" style={{ maxWidth: 720, margin: 0, fontSize: '0.98rem', lineHeight: 1.6 }}>
            Live platform telemetry and catalog inventory administration. Create products, check user orders, re-route order fulfillment status, and clear category listings.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          {[
            { id: 'overview', label: '📊 System Overview' },
            { id: 'products', label: '📦 Product Inventory' },
            { id: 'orders', label: '🛒 Customer Orders' },
            { id: 'customers', label: '👥 Customers' },
            { id: 'categories', label: '🏷️ Categories' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`button ${activeTab === tab.id ? 'primary' : ''}`}
              type="button"
              style={{
                borderRadius: '20px',
                border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: activeTab === tab.id ? '0 0 15px rgba(18,183,213,0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onClick={() => {
                setActiveTab(tab.id);
                setFilterText('');
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div className="dashboard-grid" style={{ marginBottom: 36 }}>
              {[
                { label: 'Platform Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString()}`, color: 'var(--primary)' },
                { label: 'Active Products', value: stats.totalProducts, color: 'var(--success)' },
                { label: 'Total Placed Orders', value: stats.totalOrders, color: 'var(--warning)' },
                { label: 'Registered Customers', value: stats.totalUsers, color: '#a78bfa' },
              ].map((card) => (
                <article className="card stat-card" key={card.label} style={{ position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${card.color}` }}>
                  <div className="muted" style={{ fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase' }}>{card.label}</div>
                  <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                </article>
              ))}
            </div>

            {/* Quick Metrics Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
              <div className="panel" style={{ padding: 28 }}>
                <h3 className="section-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>⚠️ Unfulfilled Queue</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--warning)', margin: '14px 0' }}>{stats.pendingOrders}</div>
                <p className="muted" style={{ fontSize: '0.92rem', margin: 0 }}>
                  Orders are currently sitting in the <strong>Placed</strong> state awaiting dispatcher shipping. Click on the <strong>Customer Orders</strong> tab above to route updates.
                </p>
              </div>
              <div className="panel" style={{ padding: 28 }}>
                <h3 className="section-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>⚡ Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                  <button className="button primary full" onClick={handleOpenAddProduct}>➕ Create New Product Item</button>
                  <button className="button full" onClick={loadData}>🔄 Refresh Server Statistics</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div className="panel" style={{ padding: 24, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <input
                className="input"
                type="text"
                placeholder="Search inventory by name/category..."
                style={{ maxWidth: 360, minHeight: 40 }}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <button className="button primary" onClick={handleOpenAddProduct}>➕ Create Product</button>
            </div>

            <div className="panel" style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <h3 className="muted">No products found</h3>
                  <p className="muted">Try refining your keyword or add a new product item.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Product</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Category</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Price</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Stock</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(prod => (
                      <tr key={prod._id} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.2s' }} className="table-row-hover">
                        <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                          <img
                            src={prod.images?.[0]?.url || 'https://via.placeholder.com/60'}
                            alt={prod.name}
                            style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700 }}>{prod.name}</div>
                            <div className="muted" style={{ fontSize: '0.78rem', maxWidth: 280, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {prod.description}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className="tag" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>{prod.category}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 800 }}>
                          ₹{prod.price}
                          {prod.originalPrice > prod.price && (
                            <span className="muted" style={{ textDecoration: 'line-through', fontSize: '0.82rem', marginLeft: 6 }}>
                              ₹{prod.originalPrice}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ color: prod.stock === 0 ? 'var(--danger)' : prod.stock < 10 ? 'var(--warning)' : 'inherit', fontWeight: 700 }}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => handleOpenEditProduct(prod)}>✏️ Edit</button>
                            <button className="btn btn-sm" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }} onClick={() => handleDeleteProduct(prod._id)}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
              <input
                className="input"
                type="text"
                placeholder="Search orders by Order ID, status, customer name..."
                style={{ maxWidth: 360, minHeight: 40 }}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            <div className="panel" style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <h3 className="muted">No orders found</h3>
                  <p className="muted">Verify user checkout items or change your search filter.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Order ID</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Customer</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Items Ordered</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Total Price</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Status</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800, textAlign: 'right' }}>Route Dispatch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order._id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '0.86rem', color: 'var(--primary)' }}>
                          {order._id}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {order.user ? (
                            <button
                              type="button"
                              onClick={() => setSelectedCustomer(order.user)}
                              style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                padding: 0, 
                                textAlign: 'left', 
                                font: 'inherit',
                                fontWeight: 700, 
                                color: 'var(--primary)', 
                                cursor: 'pointer', 
                                textDecoration: 'underline' 
                              }}
                            >
                              {order.user.name}
                            </button>
                          ) : (
                            <div style={{ fontWeight: 700 }}>Guest User</div>
                          )}
                          <div className="muted" style={{ fontSize: '0.78rem' }}>{order.user?.email || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} style={{ fontSize: '0.86rem' }}>
                                ☕ {item.name} <span className="muted">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 850 }}>
                          ₹{order.totalPrice}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            className="badge"
                            style={{
                              borderColor:
                                order.orderStatus === 'delivered' ? 'var(--success)' :
                                order.orderStatus === 'shipped' ? 'var(--primary)' :
                                order.orderStatus === 'returned' ? '#ec4899' :
                                order.orderStatus === 'cancelled' ? 'var(--danger)' : 'var(--warning)',
                              color:
                                order.orderStatus === 'delivered' ? 'var(--success)' :
                                order.orderStatus === 'shipped' ? 'var(--primary)' :
                                order.orderStatus === 'returned' ? '#ec4899' :
                                order.orderStatus === 'cancelled' ? 'var(--danger)' : 'var(--warning)',
                              background: 'transparent',
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}
                          >
                            {order.orderStatus.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <select
                            className="select"
                            value={order.orderStatus}
                            disabled={order.orderStatus === 'cancelled' || order.orderStatus === 'returned'}
                            style={{ 
                              maxWidth: 140, 
                              minHeight: 32, 
                              padding: '0 8px', 
                              fontSize: '0.82rem', 
                              opacity: (order.orderStatus === 'cancelled' || order.orderStatus === 'returned') ? 0.6 : 1 
                            }}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          >
                            {order.orderStatus === 'delivered' ? (
                              <>
                                <option value="delivered">Delivered</option>
                                <option value="returned">Returned</option>
                              </>
                            ) : order.orderStatus === 'returned' ? (
                              <option value="returned">Returned</option>
                            ) : order.orderStatus === 'cancelled' ? (
                              <option value="cancelled">Cancelled</option>
                            ) : (
                              <>
                                <option value="placed">Placed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </>
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {/* Customers Tab Content */}
        {activeTab === 'customers' && (
          <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
              <input
                className="input"
                type="text"
                placeholder="Search customers by name, email, or phone..."
                style={{ maxWidth: 360, minHeight: 40 }}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            <div className="panel" style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
              {filteredUsers.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <h3 className="muted">No customers found</h3>
                  <p className="muted">Try adjusting your search filter.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Customer Name</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Email Address</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Phone Number</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Country</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(customer => (
                      <tr key={customer._id} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.2s' }} className="table-row-hover">
                        <td style={{ padding: '14px 20px' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(customer)}
                            style={{ 
                              background: 'transparent', 
                              border: 'none', 
                              padding: 0, 
                              textAlign: 'left', 
                              font: 'inherit',
                              fontWeight: 700, 
                              color: 'var(--primary)', 
                              cursor: 'pointer', 
                              textDecoration: 'underline' 
                            }}
                          >
                            {customer.name}
                          </button>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {customer.email}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {customer.phone || <span className="muted">N/A</span>}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {customer.address?.country || <span className="muted">N/A</span>}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedCustomer(customer)}>👤 View Profile</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
          <section style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <form onSubmit={handleCreateCategory} className="panel" style={{ padding: 24, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
              <input
                className="input"
                type="text"
                placeholder="Enter new category name..."
                style={{ maxWidth: 320, minHeight: 40 }}
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button className="button primary" type="submit">➕ Create Category</button>
            </form>

            <div className="panel" style={{ overflow: 'hidden', border: '1px solid var(--border)' }}>
              {categories.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <h3 className="muted">No categories loaded</h3>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Category Name</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800 }}>Product Assortment Count</th>
                      <th style={{ padding: '16px 20px', color: 'var(--muted)', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => {
                      const count = products.filter(p => p.category === cat).length;
                      return (
                        <tr key={cat} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                          <td style={{ padding: '14px 20px', fontWeight: 700 }}>
                            🏷️ {cat}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ fontWeight: 700, color: count > 0 ? 'var(--primary)' : 'var(--muted)' }}>
                              {count} active products
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <button
                              className="btn btn-sm"
                              style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}
                              onClick={() => handleDeleteCategory(cat)}
                            >
                              🗑️ Delete Category
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

      </div>

      {/* Product Form Modal */}
      {showProductModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5, 7, 13, 0.85)', backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: 580, padding: 32, margin: 20, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 24px', fontWeight: 900 }}>
              {editingProduct ? '✏️ Edit Product Details' : '➕ Create New Product'}
            </h2>
            
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label>Product Name</label>
                <input
                  className="input"
                  type="text"
                  required
                  placeholder="e.g. SwiftMix Pro Blender"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea
                  className="textarea"
                  required
                  placeholder="Provide details about product features, materials, or package inclusion..."
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Sale Price (₹)</label>
                  <input
                    className="input"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 99"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>Original Price (₹)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="e.g. 129"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Units in Stock</label>
                  <input
                    className="input"
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>Category</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      className="select"
                      value={productForm.category}
                      style={{ flex: 1 }}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="NEW_CATEGORY_ACTION">➕ Add New...</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conditional input to type a new category */}
              {productForm.category === 'NEW_CATEGORY_ACTION' && (
                <div className="input-group" style={{ animation: 'slideDown 0.2s ease' }}>
                  <label>New Category Name</label>
                  <input
                    className="input"
                    type="text"
                    required
                    placeholder="Type new category..."
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              )}

              {/* Image Input URL */}
              <div className="input-group">
                <label>Image URL</label>
                <input
                  className="input"
                  type="text"
                  required
                  placeholder="e.g. https://domain.com/image.jpg"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                />
              </div>

              <div className="divider" style={{ margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button className="btn btn-outline" type="button" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">💾 Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5, 7, 13, 0.85)', backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: 650, padding: 32, margin: 20, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 24px', fontWeight: 900 }}>👤 Customer Profile Details</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="input-group">
                  <label>Full Name</label>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                    {selectedCustomer.name}
                  </div>
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                    {selectedCustomer.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="input-group">
                  <label>Phone Number</label>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                    {selectedCustomer.phone || 'Not Provided'}
                  </div>
                </div>
                <div className="input-group">
                  <label>Saved Address</label>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.88rem', lineHeight: 1.5, minHeight: 42 }}>
                    {selectedCustomer.address ? (
                      `${selectedCustomer.address.street || ''}, ${selectedCustomer.address.city || ''}, ${selectedCustomer.address.state || ''} - ${selectedCustomer.address.zipCode || ''}, ${selectedCustomer.address.country || ''}`
                    ) : 'No saved address details found.'}
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>📦 Previous Orders ({orders.filter(o => o.user?._id === selectedCustomer._id).length})</h3>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 24, maxHeight: 250, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '10px 14px', color: 'var(--muted)', fontWeight: 700 }}>Order ID</th>
                    <th style={{ padding: '10px 14px', color: 'var(--muted)', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 14px', color: 'var(--muted)', fontWeight: 700 }}>Items</th>
                    <th style={{ padding: '10px 14px', color: 'var(--muted)', fontWeight: 700 }}>Total</th>
                    <th style={{ padding: '10px 14px', color: 'var(--muted)', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.user?._id === selectedCustomer._id).map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--primary)' }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {order.orderItems?.map((it, idx) => (
                          <div key={idx}>☕ {it.name} (x{it.quantity})</div>
                        ))}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                        ₹{order.totalPrice}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge badge-sm" style={{ 
                          fontSize: '0.68rem', 
                          padding: '1px 6px',
                          borderColor:
                            order.orderStatus === 'delivered' ? 'var(--success)' :
                            order.orderStatus === 'shipped' ? 'var(--primary)' :
                            order.orderStatus === 'returned' ? '#ec4899' :
                            order.orderStatus === 'cancelled' ? 'var(--danger)' : 'var(--warning)',
                          color:
                            order.orderStatus === 'delivered' ? 'var(--success)' :
                            order.orderStatus === 'shipped' ? 'var(--primary)' :
                            order.orderStatus === 'returned' ? '#ec4899' :
                            order.orderStatus === 'cancelled' ? 'var(--danger)' : 'var(--warning)'
                        }}>{order.orderStatus.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" type="button" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
