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

router.get('/', getCart);
router.get('/count', getCartItemCount);
router.post('/', addItemToCart);
router.put('/', updateItemQuantity);
router.delete('/:productId', removeItemFromCart);
router.delete('/', clearUserCart);

export default router;