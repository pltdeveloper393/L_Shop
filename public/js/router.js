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
router.addRoute('/', renderHomePage);
router.addRoute('/login', renderLoginPage);
router.addRoute('/register', renderRegisterPage);
router.addRoute('/main', renderMainPage);
// маршрут профиля
router.addRoute('/profile', renderProfilePage);
// ========================================================
// ========== БУДУЩИЕ МАРШРУТЫ других частей проекта ==========
// 
