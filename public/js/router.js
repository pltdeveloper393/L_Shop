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
import { renderHomePage } from './pages/HomePage';
import { renderLoginPage } from './pages/LoginPage';
import { renderRegisterPage } from './pages/RegisterPage';
import { renderMainPage } from './pages/MainPage';
router.addRoute('/', renderHomePage);
router.addRoute('/login', renderLoginPage);
router.addRoute('/register', renderRegisterPage);
router.addRoute('/main', renderMainPage);
// ========================================================
// ========== БУДУЩИЕ МАРШРУТЫ других частей проекта ==========
// 
