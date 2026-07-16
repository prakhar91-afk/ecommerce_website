'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Header.module.css';

export default function Header() {
  const { cartCount, setIsCartOpen, isMounted: isCartMounted } = useCart();
  const { user, showLoginModal, logout, isMounted } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [searchVal, setSearchVal] = useState(query);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Keep state sync with url query parameters
  useEffect(() => {
    setSearchVal(query);
  }, [query]);

  // Handle click outside to close user dropdown menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?q=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const isActive = (path) => pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logo}>
            AURACOMMERCE
            <span className={styles.logoDot}></span>
          </Link>
        </div>

        <nav className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
          >
            Catalog
          </Link>
          <Link 
            href="/admin" 
            className={`${styles.navLink} ${isActive('/admin') ? styles.navLinkActive : ''}`}
          >
            Admin Panel
          </Link>
        </nav>

        <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
          <svg
            className={styles.searchIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search premium products..."
            className={styles.searchInput}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>

        <div className={styles.actions}>
          <button 
            className={styles.cartButton} 
            onClick={() => setIsCartOpen(true)}
            aria-label="View Cart"
          >
            <svg
              className={styles.cartIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {isCartMounted && cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>

          {isMounted && (
            user ? (
              <div className={styles.profileWrapper} ref={dropdownRef}>
                <button 
                  className={styles.avatarButton} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label="User Profile"
                >
                  {getInitials(user.name)}
                </button>
                {isDropdownOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.userName}>{user.name}</p>
                      <p className={styles.userEmail}>{user.email}</p>
                      <span className={styles.userBadge}>{user.role === 'admin' ? 'Admin' : 'Customer'}</span>
                    </div>
                    <div className={styles.dropdownDivider} />
                    {user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className={styles.dropdownItem}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <rect x="7" y="7" width="3" height="9"></rect>
                          <rect x="14" y="7" width="3" height="5"></rect>
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={`btn-primary ${styles.signInButton}`} onClick={() => showLoginModal()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Sign In
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
