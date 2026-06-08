import request from 'supertest';
import app from '../../server/app';
import * as UserModel from '../../server/models/UserModel';
import * as ProductModel from '../../server/models/ProductModel_catalog';

let userAgent: request.Agent;
let user2Agent: request.Agent;
let firstProductId: number;
const nick1 = 'test_del1_' + Date.now();
const email1 = `test_del1_${Date.now()}@test.com`;
const nick2 = 'test_del2_' + Date.now();
const email2 = `test_del2_${Date.now()}@test.com`;
const pass = 'delpass123';

beforeAll(async () => {
  const products = await ProductModel.getAllProducts();
  firstProductId = products[0]?.id || 3;

  await UserModel.createUser(nick1, email1, pass);
  await UserModel.createUser(nick2, email2, pass);

  userAgent = request.agent(app);
  await userAgent.post('/api/auth/login').send({ email: email1, password: pass });

  user2Agent = request.agent(app);
  await user2Agent.post('/api/auth/login').send({ email: email2, password: pass });
});

afterAll(async () => {
  const users = await UserModel.readUsers();
  const filtered = users.filter(u => u.nickname !== nick1 && u.nickname !== nick2);
  await UserModel.writeUsers(filtered);
});

describe('GET /api/delivery — получение доставок', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app).get('/api/delivery');
    expect(res.status).toBe(401);
  });

  test('авторизованный пользователь получает массив доставок', async () => {
    const res = await userAgent.get('/api/delivery');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('deliveries');
    expect(Array.isArray(res.body.deliveries)).toBe(true);
  });
});

describe('POST /api/delivery — создание доставки', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app)
      .post('/api/delivery')
      .send({ address: 'Addr', phone: '+37529', email: 'x@x.com', paymentMethod: 'card' });
    expect(res.status).toBe(401);
  });

  test('без всех полей возвращает 400', async () => {
    const res = await user2Agent.post('/api/delivery').send({});
    expect(res.status).toBe(400);
  });

  test('с неверным paymentMethod возвращает 400', async () => {
    const res = await user2Agent
      .post('/api/delivery')
      .send({ address: 'Addr', phone: '+37529', email: 'x@x.com', paymentMethod: 'bitcoin' });
    expect(res.status).toBe(400);
  });

  test('с пустой корзиной возвращает 500', async () => {
    const res = await user2Agent
      .post('/api/delivery')
      .send({ address: 'Addr', phone: '+37529', email: 'x@x.com', paymentMethod: 'card' });
    expect(res.status).toBe(500);
  });

  test('успешное создание с card', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: email2, password: pass });
    // Add item to cart first
    await agent.post('/api/cart').send({ productId: firstProductId, quantity: 1 });
    const res = await agent
      .post('/api/delivery')
      .send({ address: 'Test Address', phone: '+375291234567', email: 'test@test.com', paymentMethod: 'card' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('delivery');
    expect(res.body.delivery.status).toBe('pending');
    expect(res.body.delivery.paymentMethod).toBe('card');
  });
});

describe('GET /api/delivery/:id — получение доставки по ID', () => {
  let deliveryId: string | undefined;

  beforeAll(async () => {
    // Create a delivery first
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: email1, password: pass });
    await agent.post('/api/cart').send({ productId: firstProductId, quantity: 1 });
    const createRes = await agent
      .post('/api/delivery')
      .send({ address: 'Addr', phone: '+37529', email: 'x@x.com', paymentMethod: 'cash' });
    if (createRes.status === 201) {
      deliveryId = createRes.body.delivery.id;
    }
  });

  test('без авторизации возвращает 401', async () => {
    const res = await request(app).get(`/api/delivery/${deliveryId || 'nonexistent'}`);
    expect(res.status).toBe(401);
  });

  test('несуществующий ID возвращает 404', async () => {
    const res = await userAgent.get('/api/delivery/nonexistent-id-12345');
    expect(res.status).toBe(404);
  });

  test('доставка другого пользователя возвращает 403', async () => {
    if (deliveryId) {
      const res = await user2Agent.get(`/api/delivery/${deliveryId}`);
      expect(res.status).toBe(403);
    }
  });
});

describe('DELETE /api/delivery/:id — отмена доставки', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app).delete('/api/delivery/some-id');
    expect(res.status).toBe(401);
  });

  test('несуществующий ID возвращает 500', async () => {
    const res = await userAgent.delete('/api/delivery/nonexistent-id-cancel');
    expect(res.status).toBe(500);
  });

  test('отмена созданной pending доставки возвращает 200', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: email1, password: pass });
    await agent.post('/api/cart').send({ productId: firstProductId, quantity: 1 });
    const createRes = await agent
      .post('/api/delivery')
      .send({ address: 'Addr', phone: '+37529', email: 'x@x.com', paymentMethod: 'cash' });
    if (createRes.status === 201) {
      const res = await agent.delete(`/api/delivery/${createRes.body.delivery.id}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('отменена');
    }
  });
});
