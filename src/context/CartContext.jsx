'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('auracommerce_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart storage:', e);
      }
    }
  }, []);

  // Save cart to localStorage on updates
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('auracommerce_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (product, quantityToAdd = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        // Limit to available stock
        const newQty = Math.min(existingItem.quantity + quantityToAdd, product.stock);
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      
      // Check if stock is greater than 0
      if (product.stock <= 0) return prevCart;
      
      const initialQty = Math.min(quantityToAdd, product.stock);
      return [...prevCart, { ...product, quantity: initialQty }];
    });
    setIsCartOpen(true); // Open cart automatically when an item is added
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const maxQty = item.stock;
          return { ...item, quantity: Math.min(qty, maxQty) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
