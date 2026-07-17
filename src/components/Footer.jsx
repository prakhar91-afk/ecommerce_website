'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      padding: '40px 24px',
      marginTop: 'auto',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '32px'
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            marginBottom: '16px',
            letterSpacing: '1px',
            color: 'var(--text-primary)'
          }}>
            AURACOMMERCE
          </h3>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            maxWidth: '280px'
          }}>
            Futuristic curation of premium electronics, lifestyle essentials, and accessories.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
          <div>
            <h4 style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              Shop
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/?category=Audio" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
                  Audio Gear
                </Link>
              </li>
              <li>
                <Link href="/?category=Wearables" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
                  Smart Wearables
                </Link>
              </li>
              <li>
                <Link href="/?category=Accessories" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
                  Tech Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/admin" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>
                  Admin Panel
                </Link>
              </li>
              <li>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Developer Portal
                </span>
              </li>
              <li>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Security
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0 auto',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} AuraCommerce Inc. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
