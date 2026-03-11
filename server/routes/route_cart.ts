import { Router } from 'express';
import { 
  getCart, 
  addItemToCart, 
  updateItemQuantity, 
  removeItemFromCart, 
  clearUserCart,
  getCartItemCount 
} from '../controllers/controller_cart';

const router = Router();

// Получить корзину
router.get('/', getCart);

// Получить количество товаров в корзине
router.get('/count', getCartItemCount);

// Добавить товар в корзину
router.post('/', addItemToCart);

// Изменить количество товара
router.put('/', updateItemQuantity);

// Удалить товар из корзины
router.delete('/:productId', removeItemFromCart);

// Очистить корзину
router.delete('/', clearUserCart);

export default router;
