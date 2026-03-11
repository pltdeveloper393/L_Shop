import { apiCart } from '../services/api_cart.js';
import { CartItem } from '../types/index_cart.js';

export async function renderCartPage(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  try {
    const { cart, total } = await apiCart.getCart();
    const items = cart.items || [];

    if (items.length === 0) {
      app.innerHTML = `
        <div class="cart-empty">
          <h1>Корзина</h1>
          <p>Корзина пуста</p>
        </div>
      `;
      return;
    }

    const itemsHtml = items.map((item: CartItem) => `
      <div class="cart-item" data-product-id="${item.productId}">
        <img src="${item.product.img || item.product.image || ''}" alt="${item.product.name}" class="cart-item-image">
        <div class="cart-item-info">
          <h3>${item.product.name}</h3>
          <p>Цена: ${item.product.price} руб.</p>
        </div>
        <div class="cart-item-quantity">
          <span>Количество: ${item.quantity}</span>
        </div>
        <div class="cart-item-total">
          <span>${item.product.price * item.quantity} руб.</span>
        </div>
      </div>
    `).join('');

    app.innerHTML = `
      <div class="cart-page">
        <h1>Корзина</h1>
        <div class="cart-items">${itemsHtml}</div>
        <div class="cart-total">
          <h2>Итого: ${total} руб.</h2>
        </div>
      </div>
    `;
  } catch (error) {
    app.innerHTML = `<p>Ошибка при загрузке корзины</p>`;
    console.error(error);
  }
}