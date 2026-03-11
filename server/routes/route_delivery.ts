import { Router } from 'express';
import { 
  getDeliveries, 
  getDelivery, 
  createNewDelivery, 
  cancelDeliveryById 
} from '../controllers/controller_delivery';

const router = Router();

// Получить все доставки пользователя
router.get('/', getDeliveries);

// Создать доставку
router.post('/', createNewDelivery);

// Получить доставку по ID
router.get('/:id', getDelivery);

// Отменить доставку
router.delete('/:id', cancelDeliveryById);

export default router;