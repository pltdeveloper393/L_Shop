import { api } from '../services/api';
import { router } from '../main';

export async function renderHomePage() {
  const app = document.getElementById('app');
  if (!app) return;

  try {
    const { user } = await api.getMe();
    app.innerHTML = `
      <div class="wot-container">
        <h1>Добро пожаловать, ${user.nickname}!</h1>
        <p>Вы успешно вошли в систему.</p>
        <button class="wot-btn wot-btn-primary" id="catalog-btn">Каталог танков</button>
        <button class="wot-btn" id="logout-btn">Выйти</button>
      </div>
    `;

    document.getElementById('catalog-btn')?.addEventListener('click', () => {
      alert('Страница каталога в разработке');
    });

    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      try {
        await api.logout();
        router.navigateTo('/');
      } catch (err) {
        alert('Ошибка выхода');
      }
    });
  } catch {
    app.innerHTML = `
      <div class="wot-container">
        <h1>Магазин танков World of Tanks</h1>
        <p>Для продолжения войдите или зарегистрируйтесь.</p>
        <button class="wot-btn" id="login-btn">Вход</button>
        <button class="wot-btn wot-btn-primary" id="register-btn">Регистрация</button>
      </div>
    `;

    document.getElementById('login-btn')?.addEventListener('click', () => {
      router.navigateTo('/login');
    });

    document.getElementById('register-btn')?.addEventListener('click', () => {
      router.navigateTo('/register');
    });
  }
}