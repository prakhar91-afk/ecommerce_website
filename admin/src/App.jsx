import { useState, useEffect, useCallback } from 'react'
import './App.css'

const API = 'http://localhost:4000'

const CATEGORIES = ['Audio', 'Wearables', 'Accessories', 'Lifestyle']

const DEFAULT_PRODUCT = {
  name: '',
  price: '',
  old_price: '',
  category: 'Audio',
  stock: '10',
  description: '',
  image: ''
}

// ──────────────────────────────────────────
// Toast Notification Component
// ──────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="toast-close">×</button>
        </div>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card glass-card">
      <div className="stat-icon" style={{ background: color }}>
        {icon}
      </div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
// Main App
// ──────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inventory')
  const [toasts, setToasts] = useState([])

  // Auth state
  const [authStep, setAuthStep] = useState('login') // 'login' | 'dashboard'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || '')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editingProduct, setEditingProduct] = useState(DEFAULT_PRODUCT)
  const [formErrors, setFormErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  // Upload state
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  // ── Toast helpers ──────────────────────
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // ── Auth ───────────────────────────────
  useEffect(() => {
    if (adminToken) setAuthStep('dashboard')
  }, [adminToken])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Invalid credentials')
        return
      }
      localStorage.setItem('admin_token', data.token)
      setAdminToken(data.token)
      setAuthStep('dashboard')
    } catch {
      setLoginError('Cannot connect to backend. Is the server running on port 4000?')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setAdminToken('')
    setAuthStep('login')
  }

  // ── Data Fetching ──────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch(`${API}/all-products`),
        fetch(`${API}/all-orders`)
      ])
      if (prodRes.ok) setProducts(await prodRes.json())
      if (ordRes.ok) setOrders(await ordRes.json())
    } catch (err) {
      addToast('Failed to load data from backend', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    if (authStep === 'dashboard') fetchData()
  }, [authStep, fetchData])

  // ── Metrics ────────────────────────────
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 5).length
  const outOfStockCount = products.filter(p => p.stock <= 0).length

  // ── Product CRUD ───────────────────────
  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product permanently?')) return
    try {
      const res = await fetch(`${API}/remove-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id))
        addToast('Product deleted successfully')
      } else {
        addToast('Failed to delete product', 'error')
      }
    } catch {
      addToast('Network error', 'error')
    }
  }

  const handleOpenAddModal = () => {
    setEditingProduct({ ...DEFAULT_PRODUCT })
    setImagePreview('')
    setImageFile(null)
    setModalMode('add')
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (p) => {
    setEditingProduct({
      id: p.id,
      name: p.name,
      price: p.price.toString(),
      old_price: (p.old_price || '').toString(),
      category: p.category,
      stock: p.stock.toString(),
      description: p.description || '',
      image: p.image || ''
    })
    setImagePreview(p.image || '')
    setImageFile(null)
    setModalMode('edit')
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setEditingProduct(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async () => {
    if (!imageFile) return editingProduct.image
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('product', imageFile)
      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) return data.image_url
      addToast('Image upload failed', 'error')
      return editingProduct.image
    } catch {
      addToast('Image upload failed', 'error')
      return editingProduct.image
    } finally {
      setUploading(false)
    }
  }

  const validateForm = () => {
    const errs = {}
    if (!editingProduct.name.trim()) errs.name = 'Product name is required'
    if (!editingProduct.description.trim()) errs.description = 'Description is required'
    const priceNum = Number(editingProduct.price)
    if (!editingProduct.price || isNaN(priceNum) || priceNum <= 0) errs.price = 'Valid price required'
    const stockNum = Number(editingProduct.stock)
    if (editingProduct.stock === '' || isNaN(stockNum) || stockNum < 0) errs.stock = 'Valid stock count required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSaving(true)
    try {
      const imageUrl = await uploadImage()
      const payload = {
        ...editingProduct,
        price: Number(editingProduct.price),
        old_price: Number(editingProduct.old_price) || 0,
        stock: Number(editingProduct.stock),
        image: imageUrl
      }

      let res
      if (modalMode === 'add') {
        res = await fetch(`${API}/add-product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`${API}/update-product/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (res.ok) {
        setIsModalOpen(false)
        await fetchData()
        addToast(modalMode === 'add' ? 'Product added successfully!' : 'Product updated!')
      } else {
        const errData = await res.json()
        addToast(errData.error || 'Failed to save product', 'error')
      }
    } catch {
      addToast('Network error occurred', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // ──────────────────────────────────────────
  // Render: Login Screen
  // ──────────────────────────────────────────
  if (authStep === 'login') {
    return (
      <div className="login-screen">
        <Toast toasts={toasts} removeToast={removeToast} />
        <div className="login-card glass-card">
          <div className="login-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h1 className="login-title">AuraCommerce</h1>
          <p className="login-subtitle">Admin Portal</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@example.com"
                value={loginForm.email}
                onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="btn-primary login-btn" disabled={loginLoading}>
              {loginLoading ? (
                <span className="spinner"></span>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ──────────────────────────────────────────
  // Render: Dashboard
  // ──────────────────────────────────────────
  return (
    <div className="app">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>AuraCommerce</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'inventory' ? 'nav-item-active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Inventory
          </button>
          <button
            className={`nav-item ${activeTab === 'orders' ? 'nav-item-active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Orders
          </button>
        </nav>

        <div className="sidebar-footer">
          <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View Storefront
          </a>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="top-bar">
          <div>
            <h1 className="page-title">
              {activeTab === 'inventory' ? 'Product Inventory' : 'Order Management'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'inventory'
                ? `${totalProducts} products · ${lowStockCount} low stock · ${outOfStockCount} out of stock`
                : `${totalOrders} total orders · $${totalRevenue.toLocaleString()} revenue`}
            </p>
          </div>
          {activeTab === 'inventory' && (
            <button className="btn-primary" onClick={handleOpenAddModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Product
            </button>
          )}
        </header>

        {/* Stats Row */}
        <div className="stats-row">
          <StatCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
            label="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            color="rgba(139,92,246,0.2)"
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>}
            label="Total Orders"
            value={totalOrders}
            color="rgba(16,185,129,0.2)"
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}
            label="Active Products"
            value={totalProducts}
            color="rgba(245,158,11,0.2)"
          />
          <StatCard
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
            label="Low / Out of Stock"
            value={`${lowStockCount} / ${outOfStockCount}`}
            color="rgba(244,63,94,0.2)"
          />
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="shimmer skeleton-row" />)}
          </div>
        ) : (
          <>
            {/* Inventory Table */}
            {activeTab === 'inventory' && (
              <div className="table-card glass-card">
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr><td colSpan="7" className="empty-row">No products found. Add your first product!</td></tr>
                      ) : products.map(p => (
                        <tr key={p.id}>
                          <td className="id-cell">#{p.id}</td>
                          <td>
                            <div className="product-cell">
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="product-thumb"
                                  onError={e => e.target.style.display = 'none'}
                                />
                              )}
                              <div>
                                <div className="product-name">{p.name}</div>
                                <div className="product-desc">{p.description?.slice(0, 60)}…</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge badge-category">{p.category}</span></td>
                          <td className="price-cell">
                            ${p.price}
                            {p.old_price > 0 && <span className="old-price">${p.old_price}</span>}
                          </td>
                          <td>
                            <span className={
                              p.stock <= 0 ? 'badge badge-danger' :
                              p.stock < 5 ? 'badge badge-warning' :
                              'badge badge-success'
                            }>
                              {p.stock <= 0 ? 'Out of Stock' : p.stock}
                            </span>
                          </td>
                          <td>
                            <div className="stars-cell">
                              {'★'.repeat(Math.round(p.rating || 0))}{'☆'.repeat(5 - Math.round(p.rating || 0))}
                              <span className="rating-val">{p.rating}</span>
                            </div>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button className="action-btn edit-btn" onClick={() => handleOpenEditModal(p)} title="Edit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button className="action-btn delete-btn" onClick={() => handleDeleteProduct(p.id)} title="Delete">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Table */}
            {activeTab === 'orders' && (
              <div className="table-card glass-card">
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan="6" className="empty-row">No orders yet. Waiting for your first customer!</td></tr>
                      ) : orders.map(o => (
                        <tr key={o.id}>
                          <td className="id-cell" style={{ fontWeight: 600 }}>#{o.id}</td>
                          <td className="date-cell">{new Date(o.date).toLocaleDateString()}</td>
                          <td>
                            <div className="customer-name">{o.shippingAddress.name}</div>
                            <div className="customer-email">{o.shippingAddress.email}</div>
                            <div className="customer-city">{o.shippingAddress.city}</div>
                          </td>
                          <td className="items-cell">
                            {o.items.map(item => (
                              <div key={item.id} className="order-item-line">
                                {item.name} <span className="qty">×{item.quantity}</span>
                              </div>
                            ))}
                          </td>
                          <td className="revenue-cell">${o.totalAmount.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${
                              o.status === 'Processing' ? 'badge-warning' :
                              o.status === 'Shipped' ? 'badge-info' :
                              'badge-success'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form">
              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" onError={() => setImagePreview('')} />
                  ) : (
                    <div className="image-placeholder">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>Upload product image</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageFileChange} className="file-input" id="img-upload" />
                <label htmlFor="img-upload" className="file-label">
                  {imageFile ? imageFile.name : 'Choose Image File'}
                </label>
                <div className="form-row" style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— or paste a URL —</span>
                  <input
                    type="text"
                    name="image"
                    value={editingProduct.image}
                    onChange={e => { handleFormChange(e); if (!imageFile) setImagePreview(e.target.value) }}
                    placeholder="https://example.com/image.jpg"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name}
                  onChange={handleFormChange}
                  placeholder="Aether SoundPro Earbuds"
                  className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" value={editingProduct.category} onChange={handleFormChange} className="form-input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={editingProduct.price}
                    onChange={handleFormChange}
                    placeholder="149"
                    min="0"
                    className={`form-input ${formErrors.price ? 'input-error' : ''}`}
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Old Price ($) <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span></label>
                  <input
                    type="number"
                    name="old_price"
                    value={editingProduct.old_price}
                    onChange={handleFormChange}
                    placeholder="199"
                    min="0"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Count</label>
                  <input
                    type="number"
                    name="stock"
                    value={editingProduct.stock}
                    onChange={handleFormChange}
                    placeholder="15"
                    min="0"
                    className={`form-input ${formErrors.stock ? 'input-error' : ''}`}
                  />
                  {formErrors.stock && <span className="error-text">{formErrors.stock}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={editingProduct.description}
                  onChange={handleFormChange}
                  placeholder="Experience true auditory bliss..."
                  rows={4}
                  className={`form-input textarea ${formErrors.description ? 'input-error' : ''}`}
                />
                {formErrors.description && <span className="error-text">{formErrors.description}</span>}
              </div>

              <button type="submit" className="btn-primary modal-submit" disabled={isSaving || uploading}>
                {(isSaving || uploading) ? <span className="spinner"></span> : null}
                {uploading ? 'Uploading image...' : isSaving ? 'Saving...' : modalMode === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
