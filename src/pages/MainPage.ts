import { api } from '../services/api.js';
import { router } from '../main.js';
import { AuthResponse } from '../types/index.js';

export async function renderMainPage() {
  const app = document.getElementById('app');
  if (!app) return;

  try {
    const response: AuthResponse = await api.getMe();
    const user = response.user;
    
    app.innerHTML = `
      <div class="wot-container">
        <h1>Главная страница</h1>
        <p>Вы авторизованы как ${user.nickname} (${user.email})</p>
        <button class="wot-btn wot-btn-primary" id="catalog-btn">Каталог танков</button>
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
  } catch {
    router.navigateTo('/');
  }
}