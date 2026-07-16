'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import styles from '@/styles/CartDrawer.module.css';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const drawerRef = useRef(null);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsCartOpen(false)}>
      <div
        className={styles.drawer}
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()} // Prevent overlay close when clicking drawer
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Shopping Cart
          </h2>
          <button className={styles.closeButton} onClick={() => setIsCartOpen(false)}>
            <svg
              className={styles.closeIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.itemsContainer}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p>Your cart is empty</p>
              <button
                className="btn-secondary"
                onClick={() => setIsCartOpen(false)}
                style={{ marginTop: '8px' }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImageContainer}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className={styles.itemImage}
                    sizes="72px"
                    priority
                  />
                </div>
                <div className={styles.itemDetails}>
                  <div>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <span className={styles.itemPrice}>${item.price}</span>
                  </div>
                  <div className={styles.controls}>
                    <div className={styles.quantitySelector}>
                      <button
                        className={styles.qtyButton}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyButton}
                        disabled={item.quantity >= item.stock}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <svg
                        className={styles.removeIcon}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalPrice}>${cartTotal.toLocaleString()}</span>
            </div>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
              <button className={`btn-primary ${styles.checkoutButton}`}>
                Proceed to Checkout
              </button>
            </Link>
            <div className={styles.continueShopping} onClick={() => setIsCartOpen(false)}>
              Continue Shopping
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
