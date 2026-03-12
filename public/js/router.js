export class Router {
    constructor() {
        this.routes = new Map();
        window.addEventListener('popstate', () => this.handleRoute());
    }
    addRoute(path, handler) {
        this.routes.set(path, handler);
    }
    navigateTo(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }
    async handleRoute() {
        const path = window.location.pathname;
        const handler = this.routes.get(path) || this.routes.get('/');
        if (handler) {
            await handler();
        }
    }
    start() {
        this.handleRoute();
    }
}
export const router = new Router();
// ========================================================
// Auth-маршруты
import { renderHomePage } from './pages/HomePage.js';
import { renderLoginPage } from './pages/LoginPage.js';
import { renderRegisterPage } from './pages/RegisterPage.js';
import { renderMainPage } from './pages/MainPage.js';
// маршрут профиля
import { renderProfilePage } from './pages/ProfilePage.js';
// маршруты каталога, корзины и доставки
// import { renderCatalogPage } from './pages/CatalogPage_catalog.js';
// import { renderCartPage } from './pages/CartPage_cart.js';
// import { renderDeliveryPage } from './pages/DeliveryPage_delivery.js';
router.addRoute('/', renderHomePage);
router.addRoute('/login', renderLoginPage);
router.addRoute('/register', renderRegisterPage);
router.addRoute('/main', renderMainPage);
// маршрут профиля
router.addRoute('/profile', renderProfilePage);
// маршруты каталога, корзины и доставки
// router.addRoute('/catalog', renderCatalogPage);
// router.addRoute('/cart', renderCartPage);
// router.addRoute('/delivery', renderDeliveryPage);
// ========================================================
