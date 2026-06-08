import * as UserModel from '../../server/models/UserModel';
import * as ProductModel from '../../server/models/ProductModel_catalog';
import * as CartModel from '../../server/models/CartModel_cart';
import * as DeliveryModel from '../../server/models/DeliveryModel_delivery';
import * as ReviewModel from '../../server/models/ReviewModel';

let firstProductId: number;
let secondProductId: number;

beforeAll(async () => {
  const products = await ProductModel.getAllProducts();
  firstProductId = products[0]?.id || 3;
  secondProductId = products[1]?.id || 4;
});

describe('UserModel', () => {
  test('readUsers возвращает массив', async () => {
    const users = await UserModel.readUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  test('createUser создаёт пользователя с role = user', async () => {
    const nick = 'test_unit_' + Date.now();
    const user = await UserModel.createUser(nick, `test_unit_${Date.now()}@test.com`, 'testpass123');
    expect(user).toHaveProperty('id');
    expect(user.nickname).toBe(nick);
    expect(user.role).toBe('user');
    expect(user.passwordHash).not.toBe('testpass123');
  });

  test('createUser с phone создаёт пользователя с телефоном', async () => {
    const nick = 'test_phone_' + Date.now();
    const user = await UserModel.createUser(nick, `test_phone_${Date.now()}@test.com`, 'pass123', '+375291111111');
    expect(user.phone).toBe('+375291111111');
  });

  test('findUserByEmail возвращает undefined для несуществующего email', async () => {
    const notFound = await UserModel.findUserByEmail('nonexistent@test.com_' + Date.now());
    expect(notFound).toBeUndefined();
  });

  test('findUserByNickname возвращает undefined для несуществующего nickname', async () => {
    const notFound = await UserModel.findUserByNickname('NoOneHere_' + Date.now());
    expect(notFound).toBeUndefined();
  });

  test('readUsers не выбрасывает ошибку', async () => {
    await expect(UserModel.readUsers()).resolves.toBeDefined();
  });
});

describe('ProductModel', () => {
  test('getAllProducts возвращает массив товаров', async () => {
    const products = await ProductModel.getAllProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  test('getProductById возвращает товар по существующему ID', async () => {
    const product = await ProductModel.getProductById(firstProductId);
    expect(product).toBeDefined();
    expect(product?.id).toBe(firstProductId);
  });

  test('getProductById для несуществующего ID возвращает undefined', async () => {
    const product = await ProductModel.getProductById(99999);
    expect(product).toBeUndefined();
  });

  test('getFilteredProducts фильтрует по nation', async () => {
    const result = await ProductModel.getFilteredProducts({ nation: 'ussr' });
    expect(result.length).toBeGreaterThan(0);
    result.forEach(p => expect(p.nation).toBe('ussr'));
  });

  test('getFilteredProducts фильтрует по type', async () => {
    const result = await ProductModel.getFilteredProducts({ type: 'heavy' });
    result.forEach(p => expect(p.type).toBe('heavy'));
  });

  test('getFilteredProducts фильтрует по level', async () => {
    const result = await ProductModel.getFilteredProducts({ level: 10 });
    expect(result.length).toBeGreaterThan(0);
    result.forEach(p => expect(p.level).toBe(10));
  });

  test('getFilteredProducts фильтрует по inStock', async () => {
    const result = await ProductModel.getFilteredProducts({ inStock: true });
    result.forEach(p => expect(p.inStock).toBe(true));
  });

  test('getFilteredProducts сортирует price-asc', async () => {
    const result = await ProductModel.getFilteredProducts({ sortBy: 'price-asc' });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].price).toBeGreaterThanOrEqual(result[i - 1].price);
    }
  });

  test('getFilteredProducts сортирует price-desc', async () => {
    const result = await ProductModel.getFilteredProducts({ sortBy: 'price-desc' });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].price).toBeLessThanOrEqual(result[i - 1].price);
    }
  });

  test('getFilteredProducts с пустыми фильтрами возвращает все товары', async () => {
    const all = await ProductModel.getAllProducts();
    const filtered = await ProductModel.getFilteredProducts({});
    expect(filtered.length).toBe(all.length);
  });

  test('getAvailableNations возвращает уникальные нации', async () => {
    const nations = await ProductModel.getAvailableNations();
    expect(nations.length).toBeGreaterThan(0);
    const unique = new Set(nations);
    expect(unique.size).toBe(nations.length);
  });

  test('getAvailableTypes возвращает уникальные типы', async () => {
    const types = await ProductModel.getAvailableTypes();
    expect(types.length).toBeGreaterThan(0);
    const unique = new Set(types);
    expect(unique.size).toBe(types.length);
  });

  test('getAvailableLevels возвращает уникальные уровни (отсортированные)', async () => {
    const levels = await ProductModel.getAvailableLevels();
    expect(levels.length).toBeGreaterThan(0);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThan(levels[i - 1]);
    }
  });
});

describe('CartModel', () => {
  test('getOrCreateCart создаёт корзину, если её нет', async () => {
    const cart = await CartModel.getOrCreateCart('test-user-' + Date.now());
    expect(cart).toBeDefined();
    expect(cart.items).toEqual([]);
  });

  test('addToCart добавляет товар в корзину', async () => {
    const userId = 'test-cart-add-' + Date.now();
    const cart = await CartModel.addToCart(userId, firstProductId, 1);
    expect(cart.items.length).toBeGreaterThan(0);
    expect(cart.items[0].productId).toBe(firstProductId);
  });

  test('addToCart c несуществующим productId выбрасывает ошибку', async () => {
    const userId = 'test-cart-error-' + Date.now();
    await expect(CartModel.addToCart(userId, 99999, 1)).rejects.toThrow('Товар не найден');
  });

  test('addToCart увеличивает количество при повторном добавлении', async () => {
    const userId = 'test-cart-dup-' + Date.now();
    await CartModel.addToCart(userId, firstProductId, 1);
    const cart = await CartModel.addToCart(userId, firstProductId, 2);
    const item = cart.items.find(i => i.productId === firstProductId);
    expect(item?.quantity).toBe(3);
  });

  test('updateCartItemQuantity обновляет количество', async () => {
    const userId = 'test-cart-upd-' + Date.now();
    await CartModel.addToCart(userId, firstProductId, 1);
    const cart = await CartModel.updateCartItemQuantity(userId, firstProductId, 5);
    const item = cart.items.find(i => i.productId === firstProductId);
    expect(item?.quantity).toBe(5);
  });

  test('updateCartItemQuantity с quantity = 0 удаляет товар', async () => {
    const userId = 'test-cart-rem-' + Date.now();
    await CartModel.addToCart(userId, firstProductId, 1);
    const cart = await CartModel.updateCartItemQuantity(userId, firstProductId, 0);
    const item = cart.items.find(i => i.productId === firstProductId);
    expect(item).toBeUndefined();
  });

  test('updateCartItemQuantity для несуществующей корзины выбрасывает ошибку', async () => {
    await expect(CartModel.updateCartItemQuantity('no-such-user', firstProductId, 1)).rejects.toThrow('Корзина не найдена');
  });

  test('removeFromCart удаляет товар из корзины', async () => {
    const userId = 'test-cart-rem2-' + Date.now();
    await CartModel.addToCart(userId, firstProductId, 1);
    const cart = await CartModel.removeFromCart(userId, firstProductId);
    expect(cart.items.find(i => i.productId === firstProductId)).toBeUndefined();
  });

  test('clearCart очищает корзину', async () => {
    const userId = 'test-cart-clear-' + Date.now();
    await CartModel.addToCart(userId, firstProductId, 1);
    await CartModel.clearCart(userId);
    const cart = await CartModel.getCartByUserId(userId);
    expect(cart?.items).toEqual([]);
  });

  test('getCartTotal возвращает 0 для пустой корзины', async () => {
    const total = await CartModel.getCartTotal('nonexistent-user-id-' + Date.now());
    expect(total).toBe(0);
  });

  test('getCartTotal вычисляет сумму', async () => {
    const userId = 'test-cart-total-' + Date.now();
    await CartModel.addToCart(userId, firstProductId, 2);
    const total = await CartModel.getCartTotal(userId);
    expect(total).toBeGreaterThan(0);
  });
});

describe('DeliveryModel', () => {
  test('readDeliveries возвращает массив', async () => {
    const deliveries = await DeliveryModel.readDeliveries();
    expect(Array.isArray(deliveries)).toBe(true);
  });

  test('getDeliveryById для несуществующего ID возвращает undefined', async () => {
    const delivery = await DeliveryModel.getDeliveryById('nonexistent-id');
    expect(delivery).toBeUndefined();
  });

  test('cancelDelivery с неверным userId выбрасывает ошибку', async () => {
    await expect(DeliveryModel.cancelDelivery('nonexistent', 'any-user')).rejects.toThrow('Доставка не найдена');
  });

  test('updateDeliveryStatus для несуществующего ID выбрасывает ошибку', async () => {
    await expect(DeliveryModel.updateDeliveryStatus('nonexistent', 'completed')).rejects.toThrow('Доставка не найдена');
  });

  test('getDeliveriesByUserId возвращает пустой массив для несуществующего пользователя', async () => {
    const deliveries = await DeliveryModel.getDeliveriesByUserId('nonexistent-user-' + Date.now());
    expect(Array.isArray(deliveries)).toBe(true);
    expect(deliveries.length).toBe(0);
  });
});

describe('ReviewModel', () => {
  test('readReviews возвращает массив', async () => {
    const reviews = await ReviewModel.readReviews();
    expect(Array.isArray(reviews)).toBe(true);
  });

  test('getReviewsByProductId возвращает отзывы для товара', async () => {
    const reviews = await ReviewModel.getReviewsByProductId(firstProductId);
    expect(Array.isArray(reviews)).toBe(true);
  });

  test('hasUserReviewedProduct возвращает false для несуществующего отзыва', async () => {
    const result = await ReviewModel.hasUserReviewedProduct('nonexistent-user', 99999);
    expect(result).toBe(false);
  });

  test('getAverageRating возвращает 0 для товара без отзывов', async () => {
    const rating = await ReviewModel.getAverageRating(99999);
    expect(rating).toBe(0);
  });

  test('getAverageRating возвращает число от 0 до 5', async () => {
    const rating = await ReviewModel.getAverageRating(firstProductId);
    expect(rating).toBeGreaterThanOrEqual(0);
    expect(rating).toBeLessThanOrEqual(5);
  });
});
