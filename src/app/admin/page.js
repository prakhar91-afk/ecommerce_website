'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from '@/styles/Admin.module.css';

const DEFAULT_PRODUCT = {
  name: '',
  price: '',
  category: 'Audio',
  stock: '10',
  description: '',
  image: '/images/placeholder.webp'
};

export default function AdminDashboard() {
  const { cart } = useCart();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingProduct, setEditingProduct] = useState(DEFAULT_PRODUCT);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);
      
      if (prodRes.ok && ordRes.ok) {
        const prodData = await prodRes.json();
        const ordData = await ordRes.json();
        setProducts(prodData);
        setOrders(ordData);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;

  // Handle inventory deletion
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you absolutely sure you want to delete this premium product?')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingProduct({
      ...DEFAULT_PRODUCT,
      // Default dummy images for added products to avoid blank grids
      image: products.length > 0 ? products[Math.floor(Math.random() * products.length)].image : '/images/placeholder.webp'
    });
    setModalMode('add');
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      description: product.description,
      image: product.image
    });
    setModalMode('edit');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!editingProduct.name.trim()) errs.name = 'Product name is required';
    if (!editingProduct.description.trim()) errs.description = 'Description is required';
    
    const priceNum = Number(editingProduct.price);
    if (!editingProduct.price) {
      errs.price = 'Price is required';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      errs.price = 'Price must be a positive number';
    }

    const stockNum = Number(editingProduct.stock);
    if (!editingProduct.stock) {
      errs.stock = 'Stock is required';
    } else if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errs.stock = 'Stock must be a non-negative integer';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const url = modalMode === 'add' ? '/api/products' : `/api/products/${editingProduct.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          price: Number(editingProduct.price),
          stock: Number(editingProduct.stock)
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData(); // Reload inventory grid
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save product details.');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div className="shimmer" style={{ width: '250px', height: '40px' }} />
          <div className="shimmer" style={{ width: '150px', height: '40px', borderRadius: '10px' }} />
        </div>
        <div className={styles.statsGrid} style={{ marginBottom: '40px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer" style={{ height: '100px', borderRadius: '16px' }} />
          ))}
        </div>
        <div className="shimmer" style={{ width: '100%', height: '400px', borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Store Dashboard</h1>
        {activeTab === 'inventory' && (
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Product
          </button>
        )}
      </div>

      {/* Analytics Summary Panels */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <div className={`${styles.statIcon} ${styles.iconSales}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div>
            <div className={styles.statVal}>${totalRevenue.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Sales</div>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={`${styles.statIcon} ${styles.iconOrders}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div>
            <div className={styles.statVal}>{totalOrdersCount}</div>
            <div className={styles.statLabel}>Orders Placed</div>
          </div>
        </div>

        <div className={`${styles.statCard} glass-card`}>
          <div className={`${styles.statIcon} ${styles.iconProducts}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l-7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <div className={styles.statVal}>{totalProductsCount}</div>
            <div className={styles.statLabel}>Active Products</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'inventory' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Product Inventory
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Order Logs
        </button>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className={`${styles.tableCard} glass-card`}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Category</th>
                  <th className={styles.th}>Price</th>
                  <th className={styles.th}>Stock Available</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No products in catalog. Click &ldquo;Add New Product&rdquo; to seed.
                    </td>
                  </tr>
                ) : (
                  products.map((p, idx) => (
                    <tr key={p.id} className={`${styles.tr} ${idx === products.length - 1 ? styles.trLast : ''}`}>
                      <td className={styles.td} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{p.id}</td>
                      <td className={`${styles.td} ${styles.productName}`}>{p.name}</td>
                      <td className={styles.td}>
                        <span className={styles.categoryBadge}>{p.category}</span>
                      </td>
                      <td className={styles.td} style={{ fontWeight: '600' }}>${p.price}</td>
                      <td className={styles.td}>
                        <span style={p.stock <= 0 ? { color: 'var(--accent-rose)', fontWeight: '600' } : p.stock < 5 ? { color: 'var(--accent-amber)', fontWeight: '600' } : {}}>
                          {p.stock <= 0 ? 'Sold Out (0)' : p.stock}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Product"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.actionIcon}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete Product"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.actionIcon}>
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className={`${styles.tableCard} glass-card`}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Order ID</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Customer Details</th>
                  <th className={styles.th}>Items Purchased</th>
                  <th className={styles.th}>Total Revenue</th>
                  <th className={styles.th}>Order Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={styles.td} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No orders recorded. Simulate a customer purchase from the catalog!
                    </td>
                  </tr>
                ) : (
                  orders.map((o, idx) => (
                    <tr key={o.id} className={`${styles.tr} ${idx === orders.length - 1 ? styles.trLast : ''}`}>
                      <td className={styles.td} style={{ fontWeight: '600' }}>#{o.id}</td>
                      <td className={styles.td} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {new Date(o.date).toLocaleDateString()}
                      </td>
                      <td className={styles.td}>
                        <div style={{ fontWeight: '500' }}>{o.shippingAddress.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.shippingAddress.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.shippingAddress.city}</div>
                      </td>
                      <td className={styles.td} style={{ fontSize: '0.88rem' }}>
                        {o.items.map(item => (
                          <div key={item.id}>
                            {item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className={styles.td} style={{ fontWeight: '600', color: 'var(--accent-purple)' }}>
                        ${o.totalAmount.toLocaleString()}
                      </td>
                      <td className={styles.td}>
                        <span className={`${styles.badgeStatus} ${
                          o.status === 'Processing' ? styles.statusProcessing : 
                          o.status === 'Shipped' ? styles.statusShipped : styles.statusDelivered
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal Dialog Overlay */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={`${styles.modal} glass-card`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalMode === 'add' ? 'Add Store Item' : 'Modify Store Item'}
              </h3>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name}
                  onChange={handleFormChange}
                  placeholder="Ather SoundPro - Wireless Earbuds"
                  className={`${styles.formInput} ${formErrors.name ? styles.inputError : ''}`}
                />
                {formErrors.name && <span className={styles.errorText}>{formErrors.name}</span>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <select
                    name="category"
                    value={editingProduct.category}
                    onChange={handleFormChange}
                    className={styles.formInput}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Unit Price ($)</label>
                  <input
                    type="text"
                    name="price"
                    value={editingProduct.price}
                    onChange={handleFormChange}
                    placeholder="149"
                    className={`${styles.formInput} ${formErrors.price ? styles.inputError : ''}`}
                  />
                  {formErrors.price && <span className={styles.errorText}>{formErrors.price}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Stock Count</label>
                  <input
                    type="text"
                    name="stock"
                    value={editingProduct.stock}
                    onChange={handleFormChange}
                    placeholder="15"
                    className={`${styles.formInput} ${formErrors.stock ? styles.inputError : ''}`}
                  />
                  {formErrors.stock && <span className={styles.errorText}>{formErrors.stock}</span>}
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Image Path</label>
                  <input
                    type="text"
                    name="image"
                    value={editingProduct.image}
                    onChange={handleFormChange}
                    placeholder="/images/placeholder.webp"
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={editingProduct.description}
                  onChange={handleFormChange}
                  placeholder="Experience true auditory bliss..."
                  className={`${styles.formInput} ${styles.textarea} ${formErrors.description ? styles.inputError : ''}`}
                />
                {formErrors.description && <span className={styles.errorText}>{formErrors.description}</span>}
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '16px', height: '48px' }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving Product Details...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
