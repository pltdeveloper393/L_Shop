import fs from 'fs/promises';
import path from 'path';

const PRODUCTS_FILE = path.join(__dirname, '../../tanks.json');

export interface Product {
  id: number;
  name: string;
  nation: string;
  type: string;
  level: number;
  img: string;
  price: number;
  inStock: boolean;
  hp: string;
  dmg: string;
  dpm: string;
  ptrs: string;
  ptrp: string;
  spw: string;
  description?: string;
}

export async function readProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  return readProducts();
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const products = await readProducts();
  return products.find(p => p.id === id);
}