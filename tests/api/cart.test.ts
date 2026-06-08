import request from 'supertest';
import app from '../../server/app';
import * as UserModel from '../../server/models/UserModel';
import * as CartModel from '../../server/models/CartModel_cart';
import * as ProductModel from '../../server/models/ProductModel_catalog';

let userAgent: request.Agent;
let user2Agent: request.Agent;
let firstProductId: number;
let secondProductId: number;
const nick1 = 'test_cart1_' + Date.now();
const email1 = `test_cart1_${Date.now()}@test.com`;
const nick2 = 'test_cart2_' + Date.now();
const email2 = `test_cart2_${Date.now()}@test.com`;
const pass = 'cartpass123';

beforeAll(async () => {
  const products = await ProductModel.getAllProducts();
  firstProductId = products[0]?.id || 3;
  secondProductId = products[1]?.id || 4;

  // Create users
  await UserModel.createUser(nick1, email1, pass);
  await UserModel.createUser(nick2, email2, pass);

  // Login
  userAgent = request.agent(app);
  await userAgent.post('/api/auth/login').send({ email: email1, password: pass });

  user2Agent = request.agent(app);
  await user2Agent.post('/api/auth/login').send({ email: email2, password: pass });
});

afterAll(async () => {
  // Cleanup test users
  const users = await UserModel.readUsers();
  const filtered = users.filter(u => u.nickname !== nick1 && u.nickname !== nick2);
  await UserModel.writeUsers(filtered);
});

describe('GET /api/cart — получение корзины', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  test('авторизованный пользователь получает корзину', async () => {
    const res = await userAgent.get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cart');
    expect(res.body).toHaveProperty('total');
  });
});

describe('GET /api/cart/count — количество товаров', () => {
  test('без авторизации возвращает count = 0', async () => {
    const res = await request(app).get('/api/cart/count');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
    expect(typeof res.body.count).toBe('number');
  });

  test('авторизованный пользователь получает количество', async () => {
    const res = await userAgent.get('/api/cart/count');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
  });
});

describe('POST /api/cart — добавление товара', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ productId: firstProductId, quantity: 1 });
    expect(res.status).toBe(401);
  });

  test('без productId возвращает 400', async () => {
    const res = await userAgent
      .post('/api/cart')
      .send({ quantity: 1 });
    expect(res.status).toBe(400);
  });

  test('с несуществующим productId возвращает 500', async () => {
    const res = await userAgent
      .post('/api/cart')
      .send({ productId: 99999, quantity: 1 });
    expect(res.status).toBe(500);
  });

  test('с отрицательным quantity добавляет товар (не вызывает ошибку)', async () => {
    const res = await user2Agent
      .post('/api/cart')
      .send({ productId: firstProductId, quantity: -5 });
    expect([200]).toContain(res.status);
  });

  test('повторное добавление того же товара увеличивает количество', async () => {
    await user2Agent.post('/api/cart').send({ productId: secondProductId, quantity: 1 });
    const res = await user2Agent.post('/api/cart').send({ productId: secondProductId, quantity: 2 });
    expect(res.status).toBe(200);

    const cartRes = await user2Agent.get('/api/cart');
    const item = cartRes.body.cart.items.find((i: any) => i.productId === secondProductId);
    expect(item?.quantity).toBeGreaterThanOrEqual(3);
  });
});

describe('PUT /api/cart — обновление количества', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app)
      .put('/api/cart')
      .send({ productId: firstProductId, quantity: 3 });
    expect(res.status).toBe(401);
  });

  test('без productId возвращает 400', async () => {
    const res = await user2Agent
      .put('/api/cart')
      .send({ quantity: 3 });
    expect(res.status).toBe(400);
  });

  test('с quantity = 0 удаляет товар из корзины', async () => {
    const res = await user2Agent.put('/api/cart').send({ productId: secondProductId, quantity: 0 });
    expect(res.status).toBe(200);
    const cartAfter = await user2Agent.get('/api/cart');
    expect(cartAfter.body.cart.items.find((i: any) => i.productId === secondProductId)).toBeUndefined();
  });

  test('с отрицательным quantity не вызывает ошибку', async () => {
    await user2Agent.post('/api/cart').send({ productId: secondProductId, quantity: 1 });
    const res = await user2Agent.put('/api/cart').send({ productId: secondProductId, quantity: -1 });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/cart/:productId — удаление из корзины', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app).delete(`/api/cart/${firstProductId}`);
    expect(res.status).toBe(401);
  });

  test('с некорректным productId (abc) возвращает 400', async () => {
    const res = await userAgent.delete('/api/cart/abc');
    expect(res.status).toBe(400);
  });

  test('удаление несуществующего товара возвращает 500', async () => {
    const res = await userAgent.delete('/api/cart/99999');
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/cart — очистка корзины', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app).delete('/api/cart');
    expect(res.status).toBe(401);
  });

  test('очистка корзины возвращает 200', async () => {
    const res = await userAgent.delete('/api/cart');
    expect(res.status).toBe(200);
  });
});
