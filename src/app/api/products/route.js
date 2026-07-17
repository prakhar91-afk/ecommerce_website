import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || '';

    const products = await getProducts({ q, category, sort });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products in API:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, category' },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
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
