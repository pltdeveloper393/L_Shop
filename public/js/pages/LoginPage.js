import { api } from '../services/api';
import { router } from '../main';
export function renderLoginPage() {
    const app = document.getElementById('app');
    if (!app)
        return;
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
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            await api.login(email, password);
            router.navigateTo('/main');
        }
        catch (err) {
            alert(err.message);
        }
    });
    document.getElementById('back-btn')?.addEventListener('click', () => {
        router.navigateTo('/');
    });
}
