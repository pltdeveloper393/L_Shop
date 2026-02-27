import { api } from '../services/api.js';
import { router } from '../main.js';
import { AuthResponse } from '../types/index.js';

export function renderLoginPage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="wot-container">
      <h2>Вход в аккаунт</h2>
      <form id="login-form">
        <div class="wot-input-group">
          <label class="wot-label">Email</label>
          <input type="email" class="wot-input" id="email" required>
        </div>
        <div class="wot-input-group">
          <label class="wot-label">Пароль</label>
          <input type="password" class="wot-input" id="password" required>
        </div>
        <button type="submit" class="wot-btn wot-btn-primary">Войти</button>
        <button type="button" class="wot-btn" id="back-btn">Назад</button>
      </form>
    </div>
  `;

  const form = document.getElementById('login-form') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const response: AuthResponse = await api.login(email, password);
      console.log('Login successful:', response.user);
      router.navigateTo('/main');
    } catch (err: any) {
      alert(err.message);
    }
  });

  document.getElementById('back-btn')?.addEventListener('click', () => {
    router.navigateTo('/');
  });
}