import { api } from '../services/api.js';
import { router } from '../main.js';
import { AuthResponse } from '../types/index.js';

export async function renderProfilePage() {
  const app = document.getElementById('app');
  if (!app) return;

  try {
    const response: AuthResponse = await api.getMe();
    const user = response.user;

    app.innerHTML = `
      <div class="wot-container profile-page">
        <!-- Заголовок и навигация -->
        <div class="profile-header">
          <h1 class="shop-title">WOT<span class="accent">SHOP</span> / <span class="profile-title">Личный кабинет</span></h1>
          <div class="profile-actions">
            <button class="wot-btn" id="back-to-main">
              <i class="fas fa-arrow-left btn-icon"></i>
              На главную
            </button>
            <button class="wot-btn" id="logout-from-profile">
              <i class="fas fa-sign-out-alt btn-icon"></i>
              Выйти
            </button>
          </div>
        </div>

        <!-- Основной контент: информация + форма смены пароля -->
        <div class="profile-grid">
          <!-- Карточка информации о пользователе -->
          <div class="wot-card profile-info-card">
            <div class="wot-card-header">
              <h2 class="wot-card-title">
                <i class="fas fa-id-card" style="margin-right: 10px;"></i>
                Информация об аккаунте
              </h2>
            </div>
            <div class="wot-card-body">
              <div class="info-row">
                <span class="info-label">Никнейм:</span>
                <span class="info-value">${user.nickname}</span>
              </div>
              <!-- При наличии других полей (email, дата регистрации) можно добавить аналогично -->
            </div>
          </div>

          <!-- Карточка смены пароля -->
          <div class="wot-card password-card">
            <div class="wot-card-header">
              <h2 class="wot-card-title">
                <i class="fas fa-lock" style="margin-right: 10px;"></i>
                Смена пароля
              </h2>
            </div>
            <div class="wot-card-body">
              <form id="password-change-form">
                <div class="wot-input-group">
                  <label for="old-password" class="wot-label">Старый пароль</label>
                  <input type="password" id="old-password" class="wot-input" required>
                </div>
                <div class="wot-input-group">
                  <label for="new-password" class="wot-label">Новый пароль</label>
                  <input type="password" id="new-password" class="wot-input" required minlength="6">
                </div>
                <div class="wot-input-group">
                  <label for="confirm-password" class="wot-label">Подтвердите новый пароль</label>
                  <input type="password" id="confirm-password" class="wot-input" required>
                </div>
                <div id="password-error" class="error-message" style="color: #d32f2f; margin-bottom: 15px; display: none;"></div>
                <button type="submit" class="wot-btn wot-btn-primary" style="width: 100%;">
                  <i class="fas fa-sync-alt btn-icon"></i>
                  Сменить пароль
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Дополнительная информация (опционально) -->
        <div class="profile-footer">
          <p class="text-dim">
            <i class="fas fa-shield-alt" style="margin-right: 5px;"></i>
            Безопасность вашего аккаунта — наш приоритет.
          </p>
        </div>
      </div>
    `;

    document.getElementById('back-to-main')?.addEventListener('click', () => {
      router.navigateTo('/main');
    });

    document.getElementById('logout-from-profile')?.addEventListener('click', async () => {
      await api.logout();
      router.navigateTo('/');
    });

    const form = document.getElementById('password-change-form') as HTMLFormElement;
    const errorDiv = document.getElementById('password-error') as HTMLElement;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.style.display = 'none';

      const oldPassword = (document.getElementById('old-password') as HTMLInputElement).value;
      const newPassword = (document.getElementById('new-password') as HTMLInputElement).value;
      const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;

      if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Новые пароли не совпадают.';
        errorDiv.style.display = 'block';
        return;
      }
      if (newPassword.length < 6) {
        errorDiv.textContent = 'Пароль должен содержать минимум 6 символов.';
        errorDiv.style.display = 'block';
        return;
      }

      try {
        await api.changePassword(oldPassword, newPassword);
        alert('Пароль успешно изменён. Пожалуйста, войдите заново.');
        await api.logout();
        router.navigateTo('/');
      } catch (err: any) {
        errorDiv.textContent = err.message || 'Ошибка при смене пароля. Проверьте старый пароль.';
        errorDiv.style.display = 'block';
      }
    });

  } catch (error) {
    router.navigateTo('/');
  }
}