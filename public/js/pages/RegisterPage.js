import { api } from '../services/api.js';
import { router } from '../main.js';
function showNotification(message, isError = true) {
    const existing = document.querySelector('.custom-notification');
    if (existing)
        existing.remove();
    const notification = document.createElement('div');
    notification.className = `custom-notification ${isError ? 'error' : 'success'}`;
    notification.innerHTML = `
    <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
    <span>${message}</span>
  `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
export function renderRegisterPage() {
    const app = document.getElementById('app');
    if (!app)
        return;
    app.innerHTML = `
    <div class="register-page">
      <div class="register-card">
        <div class="register-header">
          <h2>IYHAN SHOP</h2>
          <p>Создание нового аккаунта</p>
        </div>
        <form id="register-form">
          <div class="wot-input-group">
            <label class="wot-label">
              <i class="fas fa-user"></i>
              Никнейм
            </label>
            <input type="text" class="wot-input" id="nickname" placeholder="Ваш никнейм" required>
          </div>
          <div class="wot-input-group">
            <label class="wot-label">
              <i class="fas fa-envelope"></i>
              Email
            </label>
            <input type="email" class="wot-input" id="email" placeholder="your@email.com" required>
          </div>
          <div class="wot-input-group">
            <label class="wot-label">
              <i class="fas fa-lock"></i>
              Пароль
            </label>
            <input type="password" class="wot-input" id="password" placeholder="Минимум 6 символов" required minlength="6">
          </div>
          <div class="wot-input-group">
            <label class="wot-label">
              <i class="fas fa-lock"></i>
              Подтверждение пароля
            </label>
            <input type="password" class="wot-input" id="confirm-password" placeholder="Повторите пароль" required minlength="6">
            <div class="password-hint" id="password-match-hint" style="display: none;">
              <i class="fas fa-check-circle" style="color: #4caf50;"></i> Пароли совпадают
            </div>
          </div>
          <div class="terms">
            <input type="checkbox" id="terms" required>
            <label for="terms">Я принимаю <a href="#">условия использования</a> и <a href="#">политику конфиденциальности</a></label>
          </div>
          <button type="submit" class="wot-btn wot-btn-primary register-btn" id="submit-btn">
            <i class="fas fa-user-plus"></i> Зарегистрироваться
          </button>
          <div class="login-link">
            Уже есть аккаунт? <a href="#" id="login-link">Войти</a>
          </div>
          <button type="button" class="back-btn" id="back-btn">
            <i class="fas fa-arrow-left"></i> На главную
          </button>
        </form>
      </div>
    </div>
  `;
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const matchHint = document.getElementById('password-match-hint');
    const submitBtn = document.getElementById('submit-btn');
    function checkPasswordMatch() {
        if (!confirmInput.value) {
            matchHint.style.display = 'none';
            return;
        }
        if (passwordInput.value === confirmInput.value) {
            matchHint.style.display = 'flex';
            matchHint.innerHTML = '<i class="fas fa-check-circle" style="color: #4caf50;"></i> Пароли совпадают';
        }
        else {
            matchHint.style.display = 'flex';
            matchHint.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #d32f2f;"></i> Пароли не совпадают';
        }
    }
    passwordInput.addEventListener('input', checkPasswordMatch);
    confirmInput.addEventListener('input', checkPasswordMatch);
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nickname = document.getElementById('nickname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.getElementById('terms').checked;
        if (!nickname || !email || !password || !confirmPassword) {
            showNotification('Пожалуйста, заполните все поля');
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают');
            return;
        }
        if (password.length < 6) {
            showNotification('Пароль должен содержать минимум 6 символов');
            return;
        }
        if (!terms) {
            showNotification('Необходимо принять условия использования');
            return;
        }
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
            const response = await api.register(nickname, email, password);
            console.log('Registration successful:', response.user);
            showNotification('Регистрация успешна! Перенаправляем...', false);
            setTimeout(() => {
                router.navigateTo('/main');
            }, 1500);
        }
        catch (err) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Зарегистрироваться';
            let errorMessage = err.message || 'Ошибка при регистрации';
            if (errorMessage.includes('email already exists')) {
                errorMessage = 'Пользователь с таким email уже существует';
            }
            else if (errorMessage.includes('nickname already exists')) {
                errorMessage = 'Пользователь с таким ником уже существует';
            }
            showNotification(errorMessage);
        }
    });
    document.getElementById('login-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigateTo('/login');
    });
    document.getElementById('back-btn')?.addEventListener('click', () => {
        router.navigateTo('/');
    });
}
