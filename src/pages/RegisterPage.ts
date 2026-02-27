import { api } from '../services/api';
import { router } from '../main';

export function renderRegisterPage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="wot-container">
      <h2>Регистрация</h2>
      <form id="register-form">
        <div class="wot-input-group">
          <label class="wot-label">Никнейм</label>
          <input type="text" class="wot-input" id="nickname" required>
        </div>
        <div class="wot-input-group">
          <label class="wot-label">Email</label>
          <input type="email" class="wot-input" id="email" required>
        </div>
        <div class="wot-input-group">
          <label class="wot-label">Пароль</label>
          <input type="password" class="wot-input" id="password" required>
        </div>
        <button type="submit" class="wot-btn wot-btn-primary">Зарегистрироваться</button>
        <button type="button" class="wot-btn" id="back-btn">Назад</button>
      </form>
    </div>
  `;

  const form = document.getElementById('register-form') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nickname = (document.getElementById('nickname') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      await api.register(nickname, email, password);
      router.navigateTo('/main');
    } catch (err: any) {
      alert(err.message);
    }
  });

  document.getElementById('back-btn')?.addEventListener('click', () => {
    router.navigateTo('/');
  });
}