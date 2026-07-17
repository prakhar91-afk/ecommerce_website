'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from '@/styles/ProductDetails.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);

  // Fetch product detail
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="shimmer" style={{ width: '100px', height: '20px', marginBottom: '32px' }} />
        <div className={styles.grid}>
          <div className={`${styles.imageWrapper} shimmer`} />
          <div className={styles.details}>
            <div className="shimmer" style={{ width: '100px', height: '16px', marginBottom: '12px' }} />
            <div className="shimmer" style={{ width: '80%', height: '40px', marginBottom: '16px' }} />
            <div className="shimmer" style={{ width: '150px', height: '20px', marginBottom: '24px' }} />
            <div className="shimmer" style={{ width: '100px', height: '32px', marginBottom: '24px' }} />
            <div className="shimmer" style={{ width: '100%', height: '80px', marginBottom: '32px' }} />
            <div className="shimmer" style={{ width: '100%', height: '100px', borderRadius: '12px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          The premium item you are looking for does not exist or has been removed.
        </p>
        <Link href="/" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Calculate remaining stock considering items already in cart
  const cartItem = cart.find((i) => i.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const availableStock = Math.max(0, product.stock - qtyInCart);
  
  // Stock status styling helpers
  const getStockStatus = () => {
    if (product.stock <= 0) {
      return <span className={`${styles.stockBadge} ${styles.stockOut}`}>Out of Stock</span>;
    }
    if (product.stock < 5) {
      return (
        <span className={`${styles.stockBadge} ${styles.stockLow}`}>
          Low Stock ({product.stock} left)
        </span>
      );
    }
    return <span className={`${styles.stockBadge} ${styles.stockIn}`}>In Stock</span>;
  };

  const handleAddToCart = () => {
    if (qty > 0 && availableStock >= qty) {
      addToCart(product, qty);
      setQty(1); // Reset select value
    }
  };

  // Helper to render stars
  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i <= floor ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: '3px' }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backLink}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Go Back
      </button>

      <div className={styles.grid}>
        <div className={`${styles.imageWrapper} glass-card`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className={styles.image}
            priority
          />
        </div>

        <div className={styles.details}>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>{renderStars(product.rating)}</div>
            <span className={styles.ratingValue}>{product.rating}</span>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <span className={styles.reviewsCount}>{product.reviews?.length || 0} reviews</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>${product.price}</span>
            {getStockStatus()}
          </div>

          <p className={styles.description}>{product.description}</p>

          <div className={styles.actionSection}>
            {product.stock > 0 ? (
              <>
                {qtyInCart > 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    You have <strong>{qtyInCart}</strong> of this item in your cart. 
                    {availableStock === 0 ? ' Max stock reached.' : ` You can add up to ${availableStock} more.`}
                  </p>
                )}

                {availableStock > 0 ? (
                  <>
                    <span className={styles.actionLabel}>Select Quantity</span>
                    <div className={styles.actionRow}>
                      <div className={styles.qtySelector}>
                        <button
                          className={styles.qtyButton}
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty <= 1}
                        >
                          -
                        </button>
                        <span className={styles.qtyValue}>{qty}</span>
                        <button
                          className={styles.qtyButton}
                          onClick={() => setQty((q) => Math.min(availableStock, q + 1))}
                          disabled={qty >= availableStock}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className={`btn-primary ${styles.addToCartBtn}`}
                        onClick={handleAddToCart}
                      >
                        Add to Cart &bull; ${(product.price * qty).toLocaleString()}
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="btn-secondary" style={{ width: '100%', cursor: 'not-allowed' }} disabled>
                    Max Allowed Quantity Added to Cart
                  </button>
                )}
              </>
            ) : (
              <button className="btn-secondary" style={{ width: '100%', cursor: 'not-allowed' }} disabled>
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <h3 className={styles.tabHeader}>
          Customer Reviews ({product.reviews?.length || 0})
        </h3>
        <div className={styles.reviewsGrid}>
          {(!product.reviews || product.reviews.length === 0) ? (
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet for this product.</p>
          ) : (
            product.reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewerName}>{review.user}</span>
                  <div className={styles.reviewStars}>{renderStars(review.rating)}</div>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
