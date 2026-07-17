import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders in API:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.items || !body.items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!body.shippingAddress || !body.shippingAddress.name || !body.shippingAddress.address) {
      return NextResponse.json({ error: 'Missing shipping details' }, { status: 400 });
    }
    if (!body.paymentMethod) {
      return NextResponse.json({ error: 'Missing payment method' }, { status: 400 });
    }

    const newOrder = await createOrder({
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      totalAmount: Number(body.totalAmount) || 0
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error processing order in API:', error);
    return NextResponse.json({ error: error.message || 'Failed to process order' }, { status: 500 });
  }
}
