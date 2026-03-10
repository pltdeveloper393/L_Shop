import { Request, Response } from 'express';
import { getCartByUserId, getCartTotal } from '../models/CartModel_cart';

function getUserId(req: Request): string {
  if (!req.session.userId) {
    req.session.userId = 'guest_' + Date.now();
  }
  return req.session.userId;
}

export async function getCart(req: Request, res: Response) {
  try {
    const userId = getUserId(req);

    const cart = await getCartByUserId(userId);
    const total = await getCartTotal(userId);

    res.json({ 
      cart: cart || { items: [] },
      total 
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при получении корзины' });
  }
}