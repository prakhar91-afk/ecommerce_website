// All data functions now proxy to the Express backend at port 4000.
// Next.js API routes call these helpers server-side.

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts({ q = '', category = '', sort = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);

  const res = await fetch(`${BACKEND_URL}/all-products?${params.toString()}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch products from backend');
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`${BACKEND_URL}/product/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function createProduct(product) {
  const res = await fetch(`${BACKEND_URL}/add-product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Failed to create product');
  const data = await res.json();
  return data.product;
}

export async function updateProduct(id, updatedData) {
  const res = await fetch(`${BACKEND_URL}/update-product/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product;
}

export async function deleteProduct(id) {
  const res = await fetch(`${BACKEND_URL}/remove-product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: Number(id) })
  });
  return res.ok;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders() {
  const res = await fetch(`${BACKEND_URL}/all-orders`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch orders from backend');
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${BACKEND_URL}/place-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create order');
  }
  return res.json();
}
