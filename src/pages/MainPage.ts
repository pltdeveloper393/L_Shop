import { api } from '../services/api.js';
import { router } from '../main.js';
import { AuthResponse } from '../types/index.js';

export async function renderMainPage() {
  const app = document.getElementById('app');
  if (!app) return;

  try {
    const response: AuthResponse = await api.getMe();
    const user = response.user;
    
    const topSellingTanks = [
      { 
        name: 'Object 140', 
        nation: 'СССР', 
        tier: 10, 
        price: 6200,
        image: 'https://via.placeholder.com/200x100/1a1c20/ff7800?text=Object+140',
        advantage: 'Лучший СТ для рандома'
      },
      { 
        name: 'IS-7', 
        nation: 'СССР', 
        tier: 10, 
        price: 5900,
        image: 'https://via.placeholder.com/200x100/1a1c20/ff7800?text=IS-7',
        advantage: 'Легендарный тяж'
      },
      { 
        name: 'E 100', 
        nation: 'Германия', 
        tier: 10, 
        price: 6100,
        image: 'https://via.placeholder.com/200x100/1a1c20/ff7800?text=E+100',
        advantage: 'Непробиваемый броня'
      },
      { 
        name: 'Leopard 1', 
        nation: 'Германия', 
        tier: 10, 
        price: 5800,
        image: 'https://via.placeholder.com/200x100/1a1c20/ff7800?text=Leopard+1',
        advantage: 'Снайперская точность'
      }
    ];

    const advantages = [
      { icon: '🚀', title: 'Мгновенная доставка', desc: 'Танк в ангаре через 5 минут' },
      { icon: '🛡️', title: 'Гарантия качества', desc: 'Все танки с полным обслуживанием' },
      { icon: '💰', title: 'Лучшие цены', desc: 'На 20% дешевле чем в премиум магазине' },
      { icon: '🎯', title: 'Бонусы за покупку', desc: 'Кэшбек до 10% золотом' }
    ];

    const newsItems = [
      { title: 'Скидка на советские танки', date: '27.02.2026', desc: '-15% на всю технику СССР' },
      { title: 'Новогодний ивент', date: '25.02.2026', desc: 'Специальные предложения' },
      { title: 'Пополнение в магазине', date: '20.02.2026', desc: 'Новые премиум танки' }
    ];
    
    app.innerHTML = `
      <div class="wot-container">
        <!-- Шапка с приветствием и навигацией -->
        <div class="shop-header">
          <div class="header-left">
            <h1 class="shop-title">WOT<span class="accent">SHOP</span></h1>
            <p class="welcome-message">С возвращением, командир ${user.nickname}!</p>
          </div>
          <div class="header-right">
            <button class="wot-btn wot-btn-primary" id="catalog-btn">
              <span class="btn-icon">🛡️</span>
              Каталог танков
            </button>
            <button class="wot-btn" id="logout-btn">
              <span class="btn-icon">🚪</span>
              Выйти
            </button>
          </div>
        </div>

        <!-- Баннер с акцией -->
        <div class="promo-banner">
          <div class="promo-content">
            <span class="promo-tag">🔥 ГОРЯЧЕЕ ПРЕДЛОЖЕНИЕ</span>
            <h2 class="promo-title">Скидка 20% на премиум технику</h2>
            <p class="promo-text">Только до конца месяца! Успейте пополнить ангар легендарными машинами.</p>
            <button class="wot-btn wot-btn-primary" id="promo-btn">Посмотреть предложение →</button>
          </div>
          <div class="promo-decoration">
            <div class="tank-silhouette"></div>
          </div>
        </div>

        <!-- Преимущества магазина -->
        <div class="advantages-section">
          <h2 class="section-title">Почему выбирают <span class="accent">WOTSHOP</span></h2>
          <div class="advantages-grid">
            ${advantages.map(adv => `
              <div class="advantage-card">
                <div class="advantage-icon">${adv.icon}</div>
                <h3 class="advantage-title">${adv.title}</h3>
                <p class="advantage-desc">${adv.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Топ продаж -->
        <div class="top-sales-section">
          <h2 class="section-title">🔥 Топ продаж этой недели</h2>
          <div class="tanks-grid">
            ${topSellingTanks.map(tank => `
              <div class="tank-sale-card">
                <div class="tank-image-container">
                  <img src="${tank.image}" alt="${tank.name}" class="tank-image">
                  <span class="tank-tier">${tank.tier} ур.</span>
                </div>
                <div class="tank-info">
                  <h3 class="tank-name">${tank.name}</h3>
                  <span class="tank-nation">${tank.nation}</span>
                  <p class="tank-advantage">✨ ${tank.advantage}</p>
                  <div class="tank-price-section">
                    <span class="tank-price">${tank.price.toLocaleString()} ₽</span>
                    <button class="wot-btn wot-btn-primary tank-buy-btn" data-tank="${tank.name}">Купить</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="section-footer">
            <button class="wot-btn" id="view-all-tanks">Все танки →</button>
          </div>
        </div>

        <!-- Новости и события -->
        <div class="news-section">
          <h2 class="section-title">📰 Новости магазина</h2>
          <div class="news-grid">
            ${newsItems.map(news => `
              <div class="news-card">
                <div class="news-date">${news.date}</div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-desc">${news.desc}</p>
                <a href="#" class="news-link">Подробнее →</a>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Статистика магазина -->
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-value">1500+</span>
            <span class="stat-label">Танков продано</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">98%</span>
            <span class="stat-label">Довольных клиентов</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">24/7</span>
            <span class="stat-label">Поддержка</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">⚡ 5 мин</span>
            <span class="stat-label">Доставка</span>
          </div>
        </div>

        <!-- Футер -->
        <div class="shop-footer">
          <p>© 2026 WOTSHOP - Официальный магазин танков</p>
          <div class="footer-links">
            <a href="#">О нас</a>
            <a href="#">Контакты</a>
            <a href="#">Доставка</a>
            <a href="#">Гарантии</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('catalog-btn')?.addEventListener('click', () => {
      router.navigateTo('/catalog');
    });

    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      await api.logout();
      router.navigateTo('/');
    });

    document.getElementById('promo-btn')?.addEventListener('click', () => {
      alert('Промо-предложения скоро появятся!');
    });

    document.getElementById('view-all-tanks')?.addEventListener('click', () => {
      router.navigateTo('/catalog');
    });

    document.querySelectorAll('.tank-buy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tankName = (e.target as HTMLElement).getAttribute('data-tank');
        alert(`Танк ${tankName} добавлен в корзину!`);
      });
    });

  } catch {
    router.navigateTo('/');
  }
}