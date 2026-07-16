import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

// Helper to guarantee the directory exists
function ensureDirExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read the database contents
export function getDb() {
  ensureDirExists();
  if (!fs.existsSync(DB_PATH)) {
    // If db file doesn't exist, return empty default schema
    return { products: [], orders: [] };
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON database, returning empty schema:', error);
    return { products: [], orders: [] };
  }
}

// Write the database contents
export function saveDb(data) {
  ensureDirExists();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to JSON database:', error);
    return false;
  }
}

// --- Product Queries ---
export function getProducts() {
  return getDb().products || [];
}

export function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id || p.id === Number(id));
}

export function createProduct(product) {
  const db = getDb();
  const nextId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
  const newProduct = {
    ...product,
    id: nextId,
    price: Number(product.price) || 0,
    rating: Number(product.rating) || 5,
    stock: Number(product.stock) || 0,
    reviews: product.reviews || []
  };
  db.products.push(newProduct);
  saveDb(db);
  return newProduct;
}

export function updateProduct(id, updatedData) {
  const db = getDb();
  const idx = db.products.findIndex(p => p.id === Number(id));
  if (idx === -1) return null;

  db.products[idx] = {
    ...db.products[idx],
    ...updatedData,
    id: Number(id), // preserve ID integrity
    price: Number(updatedData.price !== undefined ? updatedData.price : db.products[idx].price),
    stock: Number(updatedData.stock !== undefined ? updatedData.stock : db.products[idx].stock),
    rating: Number(updatedData.rating !== undefined ? updatedData.rating : db.products[idx].rating)
  };
  saveDb(db);
  return db.products[idx];
}

export function deleteProduct(id) {
  const db = getDb();
  const index = db.products.findIndex(p => p.id === Number(id));
  if (index === -1) return false;
  db.products.splice(index, 1);
  saveDb(db);
  return true;
}

// --- Order Queries ---
export function getOrders() {
  return getDb().orders || [];
}

export function createOrder(orderData) {
  const db = getDb();
  const nextId = db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 1001;
  
  // Deduct stock for each purchased item
  orderData.items.forEach(item => {
    const productIdx = db.products.findIndex(p => p.id === Number(item.id));
    if (productIdx !== -1) {
      const currentStock = db.products[productIdx].stock;
      db.products[productIdx].stock = Math.max(0, currentStock - item.quantity);
    }
  });

  const newOrder = {
    ...orderData,
    id: nextId,
    date: new Date().toISOString(),
    status: 'Processing'
  };
  
  db.orders.push(newOrder);
  saveDb(db);
  return newOrder;
}
