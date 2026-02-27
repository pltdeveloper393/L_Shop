import { router } from '../main.js';
import { api } from '../services/api.js';
import { AuthResponse } from '../types/index.js';

export async function renderHomePage() {
  const app = document.getElementById('app');
  if (!app) return;

  try {
    const response: AuthResponse = await api.getMe();
    const user = response.user;
    
    if (user) {
      app.innerHTML = `
        <div class="wot-container">
          <h1>Добро пожаловать, ${user.nickname}!</h1>
          <button class="wot-btn-primary" id="catalog-btn">Каталог танков</button>
          <button class="wot-btn" id="logout-btn">Выйти</button>
        </div>
      `;
      
      document.getElementById('catalog-btn')?.addEventListener('click', () => {
        alert('Страница каталога в разработке');
      });
      
      document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await api.logout();
        router.navigateTo('/');
      });
    } else {
      renderNotAuth(app);
    }
  } catch {
    renderNotAuth(app);
  }
}

function renderNotAuth(app: HTMLElement) {
  app.innerHTML = `
    <div class="wot-container">
      <h1>Магазин танков WOT</h1>
      <button class="wot-btn" id="login-btn">Вход</button>
      <button class="wot-btn-primary" id="register-btn">Регистрация</button>
    </div>
  `;
  
  document.getElementById('login-btn')?.addEventListener('click', () => {
    router.navigateTo('/login');
  });
  
  document.getElementById('register-btn')?.addEventListener('click', () => {
    router.navigateTo('/register');
  });
}