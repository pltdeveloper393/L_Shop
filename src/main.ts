import { router } from './router.js';
import { renderCartPage } from './pages/CartPage_cart.js';

export { router };

router.addRoute('/', renderCartPage);
router.addRoute('/cart', renderCartPage);

document.addEventListener('DOMContentLoaded', () => {
  router.start();
});