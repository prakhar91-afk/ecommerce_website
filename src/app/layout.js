import { Suspense } from 'react';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'AuraCommerce | Premium Curated Storefront',
  description: 'A modern full-stack e-commerce experience for premium lifestyle and tech accessories.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={
              <div style={{ height: '70px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading storefront navigation...</span>
              </div>
            }>
              <Header />
            </Suspense>
            
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
              {children}
            </main>
            
            <CartDrawer />
            <AuthModal />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
