export async function renderDeliveryPage() {
  const app = document.getElementById('app');
  if (!app) return;

  // Показываем загрузку
  app.innerHTML = `
    <div class="wot-container">
      <div class="loading-message" style="text-align: center; padding: 50px;">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--wot-primary);"></i>
        <p style="margin-top: 20px;">Загрузка оформления...</p>
      </div>
    </div>
  `;

  try {
    // Тестовые данные (корзины нет)
    const items: any[] = [{ 
      product: { 
        name: 'Тестовый танк', 
        img: '/images/tanks/test-tank.png', 
        price: 1000 
      }, 
      quantity: 1 
    }];
    const total = 1000;

    app.innerHTML = `
      <div class="wot-container">
        <!-- Шапка -->
        <div class="delivery-header">
          <div class="header-left">
            <h1 class="shop-title">IYHAN<span class="accent">SHOP</span></h1>
            <span class="delivery-subtitle">ОФОРМЛЕНИЕ ДОСТАВКИ</span>
          </div>
          <div class="header-right">
            <button class="wot-btn" id="main-btn">
              <i class="fas fa-home btn-icon"></i>
              Главная
            </button>
          </div>
        </div>

        <div class="delivery-content">
          <!-- Левая часть - форма -->
          <div class="delivery-form-section">
            <h2 class="section-title">
              <i class="fas fa-truck"></i>
              Данные для доставки
            </h2>
            
            <form class="delivery-form" id="delivery-form" data-delivery>
              <div class="form-group">
                <label class="wot-label" for="address">
                  <i class="fas fa-user"></i>
                  Никнейм *
                </label>
                <input type="text" id="address" name="address" class="wot-input" 
                       placeholder="Ваш никнейм в игре" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="wot-label" for="phone">
                    <i class="fas fa-phone"></i>
                    Телефон *
                  </label>
                  <input type="tel" id="phone" name="phone" class="wot-input" 
                         placeholder="+375 (29) 123-45-67" required>
                </div>

                <div class="form-group">
                  <label class="wot-label" for="email">
                    <i class="fas fa-envelope"></i>
                    Email *
                  </label>
                  <input type="email" id="email" name="email" class="wot-input" 
                         placeholder="example@mail.com" required>
                </div>
              </div>

              <div class="form-group">
                <label class="wot-label">
                  <i class="fas fa-credit-card"></i>
                  Способ оплаты *
                </label>
                <div class="payment-methods">
                  <label class="payment-option">
                    <input type="radio" name="paymentMethod" value="card" checked>
                    <span class="payment-card">
                      <i class="fas fa-credit-card"></i>
                      Банковская карта
                    </span>
                  </label>
                  <label class="payment-option">
                    <input type="radio" name="paymentMethod" value="cash">
                    <span class="payment-cash">
                      <i class="fas fa-money-bill-wave"></i>
                      Наличными при получении
                    </span>
                  </label>
                </div>
              </div>

              <!-- Форма данных карты -->
              <div class="card-form" id="card-form">
                <div class="card-preview">
                  <div class="card-front">
                    <div class="card-chip"></div>
                    <div class="card-number-display" id="card-number-display">•••• •••• •••• ••••</div>
                    <div class="card-details">
                      <div class="card-holder-display">
                        <span class="card-label">Держатель</span>
                        <span id="card-holder-display">ИМЯ ФАМИЛИЯ</span>
                      </div>
                      <div class="card-expiry-display">
                        <span class="card-label">Срок</span>
                        <span id="card-expiry-display">MM/YY</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="card-inputs">
                  <div class="form-group">
                    <label class="wot-label" for="cardNumber">
                      <i class="fas fa-credit-card"></i>
                      Номер карты *
                    </label>
                    <input type="text" id="cardNumber" name="cardNumber" class="wot-input card-input" 
                           placeholder="0000 0000 0000 0000" maxlength="19" autocomplete="cc-number">
                  </div>
                  
                  <div class="form-group">
                    <label class="wot-label" for="cardHolder">
                      <i class="fas fa-user"></i>
                      Имя держателя *
                    </label>
                    <input type="text" id="cardHolder" name="cardHolder" class="wot-input" 
                           placeholder="IVAN IVANOV" autocomplete="cc-name">
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label class="wot-label" for="cardExpiry">
                        <i class="fas fa-calendar"></i>
                        Срок действия *
                      </label>
                      <input type="text" id="cardExpiry" name="cardExpiry" class="wot-input" 
                             placeholder="MM/YY" maxlength="5" autocomplete="cc-exp">
                    </div>
                    
                    <div class="form-group">
                      <label class="wot-label" for="cardCvv">
                        <i class="fas fa-lock"></i>
                        CVV *
                      </label>
                      <input type="password" id="cardCvv" name="cardCvv" class="wot-input" 
                             placeholder="•••" maxlength="3" autocomplete="cc-csc">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Капча -->
              <div class="form-group captcha-group">
                <label class="wot-label">
                  <i class="fas fa-shield-alt"></i>
                  Подтвердите, что вы не робот
                </label>
                <div class="captcha-box">
                  <span class="captcha-question" id="captcha-question"></span>
                  <input type="number" id="captcha-answer" class="wot-input captcha-input" 
                         placeholder="?" required>
                  <button type="button" class="wot-btn refresh-captcha" id="refresh-captcha">
                    <i class="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>

              <button type="submit" class="wot-btn wot-btn-primary submit-order-btn">
                <i class="fas fa-check"></i>
                Подтвердить заказ
              </button>
            </form>
          </div>

          <!-- Правая часть - сводка заказа -->
          <div class="delivery-summary-section">
            <div class="order-summary">
              <h3 class="summary-title">
                <i class="fas fa-clipboard-list"></i>
                Ваш заказ
              </h3>
              
              <div class="order-items">
                ${items.map((item: any) => `
                  <div class="order-item">
                    <img src="${item.product.img}" alt="${item.product.name}" class="order-item-img">
                    <div class="order-item-info">
                      <span class="order-item-name">${item.product.name}</span>
                      <span class="order-item-qty">x${item.quantity}</span>
                    </div>
                    <span class="order-item-price">
                      <i class="fas fa-coins"></i>
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                `).join('')}
              </div>

              <hr class="summary-divider">

              <div class="summary-row summary-total">
                <span>Итого к оплате:</span>
                <span class="total-amount">
                  <i class="fas fa-coins"></i>
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            <div class="delivery-info-box">
              <h4><i class="fas fa-info-circle"></i> Информация о доставке</h4>
              <ul>
                <li><i class="fas fa-check"></i> Срок доставки: 5-10 минут</li>
                <li><i class="fas fa-check"></i> Танк появится в вашем ангаре</li>
                <li><i class="fas fa-check"></i> Гарантия на все товары</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Футер -->
        <div class="shop-footer">
          <p>
            <i class="far fa-copyright"></i>
            2026 IYHANSHOP - Официальный магазин танков
          </p>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Ошибка загрузки страницы доставки:', err);
    app.innerHTML = `
      <div class="wot-container">
        <div class="error-message" style="text-align: center; padding: 50px;">
          <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #d32f2f;"></i>
          <h2 style="margin-top: 20px;">Ошибка загрузки</h2>
          <p style="color: #888; margin: 10px 0;">Не удалось загрузить данные для оформления</p>
          <button class="wot-btn wot-btn-primary" onclick="window.location.reload()" style="margin-top: 20px;">
            <i class="fas fa-sync-alt"></i> Обновить страницу
          </button>
        </div>
      </div>
    `;
  }
}