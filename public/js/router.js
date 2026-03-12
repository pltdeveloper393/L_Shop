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
import { renderDeliveryPage } from './pages/DeliveryPage_delivery.js';
router.addRoute('/', renderDeliveryPage);
router.addRoute('/delivery', renderDeliveryPage);
// ========================================================
