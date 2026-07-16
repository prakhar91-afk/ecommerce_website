'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, showLoginModal } = useAuth();

  const [step, setStep] = useState('shipping'); // 'shipping' | 'payment' | 'success'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Auto-populate form data when user logs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Redirect if cart is empty and not checked out
  useEffect(() => {
    if (cart.length === 0 && step !== 'success') {
      router.push('/');
    }
  }, [cart, step, router]);

  // Pricing calculations
  const subtotal = cartTotal;
  const shipping = subtotal > 200 ? 0 : 15;
  const tax = Math.round(subtotal * 0.0825 * 100) / 100;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateShipping = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!formData.address.trim()) errs.address = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.zip.trim()) {
      errs.zip = 'ZIP code is required';
    } else if (!/^\d{5,6}$/.test(formData.zip)) {
      errs.zip = 'ZIP code should be 5 or 6 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs = {};
    if (!formData.cardName.trim()) errs.cardName = 'Name on card is required';
    if (!formData.cardNumber.trim()) {
      errs.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      errs.cardNumber = 'Please enter a valid 16-digit card number';
    }
    if (!formData.cardExpiry.trim()) {
      errs.cardExpiry = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry)) {
      errs.cardExpiry = 'Use MM/YY format';
    }
    if (!formData.cardCvc.trim()) {
      errs.cardCvc = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
      errs.cardCvc = 'CVC must be 3 or 4 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
        },
        paymentMethod: 'Credit Card (Simulated)',
        totalAmount: total,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedOrder(data);
        clearCart();
        setStep('success');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to complete transaction.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Network error, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className={styles.container}>
        <div className={`${styles.successScreen} glass-card animate-fade-in`}>
          <div className={styles.successIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className={styles.successTitle}>Order Confirmed!</h1>
          <p className={styles.successText}>
            Thank you for shopping with AuraCommerce. Your transaction was processed successfully. 
            A confirmation receipt will be sent to <strong>{formData.email}</strong> shortly.
          </p>

          {createdOrder && (
            <div className={styles.invoice}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '16px' }}>
                Invoice Summary
              </h3>
              <div className={styles.invoiceRow}>
                <span>Order Reference:</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  #{createdOrder.id}
                </strong>
              </div>
              <div className={styles.invoiceRow}>
                <span>Date:</span>
                <span>{new Date(createdOrder.date).toLocaleDateString()}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Payment Mode:</span>
                <span>{createdOrder.paymentMethod}</span>
              </div>
              <div className={styles.invoiceRow}>
                <span>Ship To:</span>
                <span>
                  {createdOrder.shippingAddress.name}, {createdOrder.shippingAddress.city}
                </span>
              </div>

              <div className={styles.invoiceDivider}></div>

              <div style={{ marginBottom: '12px' }}>
                {createdOrder.items.map((item) => (
                  <div key={item.id} className={styles.invoiceRow} style={{ fontSize: '0.85rem' }}>
                    <span>
                      {item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                    </span>
                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className={styles.invoiceDivider}></div>

              <div className={styles.invoiceRow} style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: 0 }}>
                <span>Amount Paid:</span>
                <span style={{ color: 'var(--accent-purple)' }}>
                  ${createdOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <Link href="/">
            <button className="btn-primary" style={{ width: '100%' }}>
              Return to Storefront
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Secure Checkout</h1>

      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${styles.stepActive} ${step === 'payment' ? styles.stepCompleted : ''}`}>
              <span className={styles.stepNumber}>1</span>
              <span>Shipping Information</span>
            </div>
            <div className={`${styles.step} ${step === 'payment' ? styles.stepActive : ''}`}>
              <span className={styles.stepNumber}>2</span>
              <span>Billing Details</span>
            </div>
          </div>

          {step === 'shipping' ? (
            <div className={`${styles.checkoutForm} glass-card animate-fade-in`}>
              <h2 className={styles.sectionTitle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Shipping Details
              </h2>
              
              {!user && (
                <div style={{
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Already have an account?
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Sign in to retrieve your shipping details for a faster checkout.
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={() => showLoginModal()}
                    style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '10px', flexShrink: 0 }}
                  >
                    Sign In
                  </button>
                </div>
              )}

              <form onSubmit={handleShippingSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Science Park Drive"
                    className={`${styles.formInput} ${errors.address ? styles.inputError : ''}`}
                  />
                  {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="San Francisco"
                      className={`${styles.formInput} ${errors.city ? styles.inputError : ''}`}
                    />
                    {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="94107"
                      className={`${styles.formInput} ${errors.zip ? styles.inputError : ''}`}
                    />
                    {errors.zip && <span className={styles.errorText}>{errors.zip}</span>}
                  </div>
                </div>

                <div className={styles.buttonRow}>
                  <div></div>
                  <button type="submit" className="btn-primary">
                    Proceed to Payment
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className={`${styles.checkoutForm} glass-card animate-fade-in`}>
              <h2 className={styles.sectionTitle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Payment Information
              </h2>
              <form onSubmit={handlePaymentSubmit}>
                <div className={styles.paymentOption} className={`${styles.paymentOption} ${styles.paymentOptionSelected}`}>
                  <div className={styles.radioCircle}>
                    <div className={styles.radioCircleInner}></div>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Credit Card (Simulated Sandbox)</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="JOHN DOE"
                    className={`${styles.formInput} ${errors.cardName ? styles.inputError : ''}`}
                  />
                  {errors.cardName && <span className={styles.errorText}>{errors.cardName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="4111 2222 3333 4444"
                    maxLength="19"
                    className={`${styles.formInput} ${errors.cardNumber ? styles.inputError : ''}`}
                  />
                  {errors.cardNumber && <span className={styles.errorText}>{errors.cardNumber}</span>}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Expiration Date</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className={`${styles.formInput} ${errors.cardExpiry ? styles.inputError : ''}`}
                    />
                    {errors.cardExpiry && <span className={styles.errorText}>{errors.cardExpiry}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CVC Security Code</label>
                    <input
                      type="password"
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="4"
                      className={`${styles.formInput} ${errors.cardCvc ? styles.inputError : ''}`}
                    />
                    {errors.cardCvc && <span className={styles.errorText}>{errors.cardCvc}</span>}
                  </div>
                </div>

                <div className={styles.buttonRow}>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="btn-secondary"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Placing Order...' : `Pay $${total.toLocaleString()}`}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className={styles.summaryColumn}>
          <div className={`${styles.summaryCard} glass-card`}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '20px' }}>
              Order Details
            </h3>

            <div className={styles.summaryItems}>
              {cart.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div>
                    <span className={styles.summaryItemName}>{item.name}</span>
                    <span className={styles.summaryItemQty}> &times; {item.quantity}</span>
                  </div>
                  <span className={styles.summaryItemPrice}>
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.calcRow}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--text-primary)' }}>
                ${subtotal.toLocaleString()}
              </span>
            </div>
            <div className={styles.calcRow}>
              <span>Shipping Fee</span>
              <span style={{ color: 'var(--text-primary)' }}>
                {shipping === 0 ? 'FREE' : `$${shipping}`}
              </span>
            </div>
            <div className={styles.calcRow}>
              <span>Taxes (8.25%)</span>
              <span style={{ color: 'var(--text-primary)' }}>
                ${tax.toLocaleString()}
              </span>
            </div>

            <div className={styles.calcTotalRow}>
              <span>Estimated Total</span>
              <span style={{ color: 'var(--accent-purple)' }}>
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
