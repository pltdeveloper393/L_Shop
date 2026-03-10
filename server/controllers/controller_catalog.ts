import { Request, Response } from 'express';
import { getAllProducts, getProductById } from '../models/ProductModel_catalog';

// Получить все товары
export async function getProducts(req: Request, res: Response) {
  try {
    const products = await getAllProducts();
    res.json({ products });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении товаров' });
  }
}

// Получить товар по ID
export async function getProduct(req: Request, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Некорректный ID товара' });
    }

    const product = await getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json({ product });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении товара' });
  }
}