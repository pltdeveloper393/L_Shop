import { api } from '../services/api';
export async function renderHomePage() {
    const app = document.getElementById('app');
    if (!app)
        return;
    try {
        const response = await api.getMe();
        const user = response.user;
        if (user) {
            app.innerHTML = `
        <div class="wot-container">
          <h1>Добро пожаловать, ${user.nickname}!</h1>
          <button class="wot-btn-primary" id="catalog-btn">Каталог танков</button>
          <button class="wot-btn" id="logout-btn">Выйти</button>
        </div>
      `;
        }
        else {
            app.innerHTML = `
        <div class="wot-container">
          <h1>Магазин танков WOT</h1>
          <button class="wot-btn" id="login-btn">Вход</button>
          <button class="wot-btn-primary" id="register-btn">Регистрация</button>
        </div>
      `;
        }
    }
    catch {
        app.innerHTML = `
      <div class="wot-container">
        <h1>Магазин танков WOT</h1>
        <button class="wot-btn" id="login-btn">Вход</button>
        <button class="wot-btn-primary" id="register-btn">Регистрация</button>
      </div>
    `;
    }
}
