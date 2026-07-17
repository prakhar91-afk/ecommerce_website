'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from '@/styles/ProductGrid.module.css';

// Categories list
const CATEGORIES = ['All', 'Audio', 'Wearables', 'Accessories', 'Lifestyle'];

function CatalogLoading() {
  return (
    <div className={styles.catalogSection}>
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer" style={{ width: '80px', height: '36px', borderRadius: '20px' }} />
          ))}
        </div>
        <div className="shimmer" style={{ width: '180px', height: '36px', borderRadius: '10px' }} />
      </div>
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={`${styles.skeletonImage} shimmer`} />
            <div className={`${styles.skeletonText} shimmer`} style={{ width: '80%' }} />
            <div className={`${styles.skeletonText} shimmer`} style={{ width: '50%' }} />
            <div className={styles.footer} style={{ marginTop: 'auto' }}>
              <div className="shimmer" style={{ width: '60px', height: '24px', borderRadius: '4px' }} />
              <div className="shimmer" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, cart } = useCart();

  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');

  // Fetch products based on search term, category and sort parameters
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let url = `/api/products?q=${encodeURIComponent(query)}&category=${encodeURIComponent(selectedCategory)}`;
        if (sortBy === 'price_asc' || sortBy === 'price_desc' || sortBy === 'rating') {
          url += `&sort=${sortBy}`;
        }
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [query, selectedCategory, sortBy]);

  const handleCategorySelect = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Helper to check item quantity in cart against stock
  const getItemQtyInCart = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  // Helper to render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i <= floor ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: '2px' }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Summer Curation 2026</span>
          <h1 className={styles.heroTitle}>
            Step into the Future of <br />
            <span className={styles.heroTitleHighlight}>Premium Shopping</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Immerse yourself in our custom-designed collection of high-fidelity audio equipment, intelligent wearables, and ergonomic desktop accessories.
          </p>
        </div>
      </section>

      <section className={styles.catalogSection}>
        <div className={styles.filterBar}>
          <div className={styles.categoryTabs}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`${styles.tab} ${selectedCategory === cat ? styles.tabActive : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.sortWrapper}>
            <span className={styles.sortLabel}>Sort by</span>
            <select className={styles.sortSelect} value={sortBy} onChange={handleSortChange}>
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {query && (
          <div style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
            Showing results for &ldquo;<strong>{query}</strong>&rdquo;
          </div>
        )}

        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={`${styles.skeletonImage} shimmer`} />
                <div className={`${styles.skeletonText} shimmer`} style={{ width: '80%' }} />
                <div className={`${styles.skeletonText} shimmer`} style={{ width: '50%' }} />
                <div className={styles.footer} style={{ marginTop: 'auto' }}>
                  <div className="shimmer" style={{ width: '60px', height: '24px', borderRadius: '4px' }} />
                  <div className="shimmer" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.noResults}>
            <svg
              className={styles.noResultsIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No products found matching your criteria</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Try adjusting your filters or search keywords</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => {
              const qtyInCart = getItemQtyInCart(product.id);
              const isMaxedOut = qtyInCart >= product.stock;
              const hasStock = product.stock > 0;

              return (
                <div key={product.id} className={`${styles.card} glass-card animate-fade-in`} style={{ padding: '16px' }}>
                  <div className={styles.imageContainer}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className={styles.image}
                      priority={product.id <= 3}
                    />
                    <span className={styles.badge}>{product.category}</span>
                  </div>

                  <div className={styles.rating}>
                    {renderStars(product.rating)}
                    <span className={styles.ratingCount}>({product.reviews?.length || 0})</span>
                  </div>

                  <Link href={`/products/${product.id}`}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  <p className={styles.description}>{product.description}</p>

                  <div className={styles.footer}>
                    <span className={styles.price}>${product.price}</span>
                    {hasStock ? (
                      <button
                        className={`btn-primary ${styles.addButton}`}
                        disabled={isMaxedOut}
                        onClick={() => addToCart(product)}
                        style={isMaxedOut ? { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', boxShadow: 'none', cursor: 'not-allowed' } : {}}
                      >
                        {isMaxedOut ? 'Limit Reached' : qtyInCart > 0 ? `In Cart (${qtyInCart})` : 'Add to Cart'}
                      </button>
                    ) : (
                      <span className={styles.outOfStock}>Out of Stock</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <ProductGrid />
    </Suspense>
  );
}
