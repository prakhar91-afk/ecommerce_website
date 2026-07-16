import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || ''; // 'price_asc', 'price_desc', 'rating'

    let filtered = getProducts();

    if (q) {
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching products in API:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: 'Missing required fields: name, price, category' }, { status: 400 });
    }

    const newProduct = createProduct({
      name: body.name,
      price: Number(body.price),
      description: body.description || '',
      category: body.category,
      image: body.image || '/images/placeholder.webp',
      stock: Number(body.stock) || 0,
      rating: 5,
      reviews: []
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product in API:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
