import fs from 'fs/promises';
import path from 'path';

const CARTS_FILE = path.join(__dirname, '../../carts.json');

export interface Product {
  id: number;
  name: string;
  price: number;
  img?: string;
  level?: number;
  type?: string;
  nation?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export async function readCarts(): Promise<Cart[]> {
  try {
    const data = await fs.readFile(CARTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function writeCarts(carts: Cart[]): Promise<void> {
  await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2));
}

export async function getCartByUserId(userId: string): Promise<Cart | undefined> {
  const carts = await readCarts();
  return carts.find(c => c.userId === userId);
}

export async function createCart(userId: string): Promise<Cart> {
  const carts = await readCarts();
  const newCart: Cart = {
    userId,
    items: [],
    updatedAt: new Date().toISOString()
  };
  carts.push(newCart);
  await writeCarts(carts);
  return newCart;
}

export async function getOrCreateCart(userId: string): Promise<Cart> {
  let cart = await getCartByUserId(userId);
  if (!cart) {
    cart = await createCart(userId);
  }
  return cart;
}