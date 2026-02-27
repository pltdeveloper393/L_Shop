type PageFunction = () => void | Promise<void>;

export class Router {
  private routes: Map<string, PageFunction> = new Map();
  
  constructor() {
    window.addEventListener('popstate', () => this.handleRoute());
  }
  
  addRoute(path: string, handler: PageFunction) {
    this.routes.set(path, handler);
  }
  
  navigateTo(path: string) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }
  
  private async handleRoute() {
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

router.addRoute('/', renderHomePage);
router.addRoute('/login', renderLoginPage);
router.addRoute('/register', renderRegisterPage);
router.addRoute('/main', renderMainPage);
// ========================================================

// ========== БУДУЩИЕ МАРШРУТЫ других частей проекта ==========
// 