import { Router } from 'express';
import { getProducts, getProduct } from '../controllers/controller_catalog';

const router = Router();

// Получить все товары
router.get('/', getProducts);

// Получить товар по ID
router.get('/:id', getProduct);

export default router;