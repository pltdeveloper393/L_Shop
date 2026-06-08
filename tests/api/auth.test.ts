import request from 'supertest';
import app from '../../server/app';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(__dirname, '../../users.json');
let testUser: { nickname: string; email: string; password: string; phone?: string };
let registeredId: string;

beforeAll(async () => {
  const ts = Date.now();
  testUser = {
    nickname: 'test_auth_' + ts,
    email: `test_auth_${ts}@test.com`,
    password: 'testpass123',
    phone: '+375291111111'
  };
});

afterAll(async () => {
  // Cleanup test users
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  const users = JSON.parse(data);
  const filtered = users.filter((u: any) => !u.nickname.startsWith('test_auth_'));
  await fs.writeFile(USERS_FILE, JSON.stringify(filtered, null, 2));
});

describe('POST /api/auth/register', () => {
  test('успешная регистрация с валидными данными', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.message).toContain('успешно');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.nickname).toBe(testUser.nickname);
    expect(res.body.user.email).toBe(testUser.email);
    registeredId = res.body.user.id;
  });

  test('регистрация с пустым nickname возвращает 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nickname: '', email: 'x@x.com', password: '123456' });
    expect(res.status).toBe(400);
  });

  test('регистрация без email возвращает 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nickname: 'test_no_email', password: '123456' });
    expect(res.status).toBe(400);
  });

  test('регистрация без password возвращает 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nickname: 'test_no_pass', email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  test('регистрация с существующим email возвращает 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nickname: 'test_dup_' + Date.now(), email: testUser.email, password: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/существует/i);
  });

  test('регистрация с существующим nickname возвращает 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nickname: testUser.nickname, email: `other_${Date.now()}@test.com`, password: '123456' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/существует/i);
  });

  test('регистрация с SQL-подобными данными не вызывает ошибку сервера', async () => {
    const ts = Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nickname: `'; DROP TABLE users; -- ${ts}`,
        email: `sqltest_${ts}@test.com`,
        password: "'; OR '1'='1"
      });
    expect(res.status).not.toBe(500);
  });
});

describe('POST /api/auth/login', () => {
  test('успешный вход с корректными данными только что созданного пользователя', async () => {
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('успешно');
    expect(res.body.user).toHaveProperty('id');
  });

  test('вход с пустым email возвращает 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '', password: '123456' });
    expect(res.status).toBe(400);
  });

  test('вход с пустым password возвращает 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '' });
    expect(res.status).toBe(400);
  });

  test('вход с неверным email возвращает 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: '123456' });
    expect(res.status).toBe(401);
  });

  test('вход с неверным паролем возвращает 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('вход без тела запроса возвращает 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  test('без авторизации возвращает 401', async () => {
    const freshAgent = request.agent(app);
    const res = await freshAgent.get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('после успешного входа возвращает данные пользователя', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('nickname');
    expect(res.body.user).toHaveProperty('email');
  });

  test('после logout /api/auth/me возвращает 401', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    await agent.post('/api/auth/logout');
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  test('logout без сессии возвращает успех (200)', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });

  test('двойной logout возвращает успех', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    const res1 = await agent.post('/api/auth/logout');
    expect(res1.status).toBe(200);
    const res2 = await agent.post('/api/auth/logout');
    expect(res2.status).toBe(200);
  });
});

describe('POST /api/auth/change-password', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .send({ oldPassword: 'testpass123', newPassword: 'newpass123' });
    expect(res.status).toBe(401);
  });

  test('с неверным старым паролем возвращает 400', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    const res = await agent
      .post('/api/auth/change-password')
      .send({ oldPassword: 'wrongold', newPassword: 'newpass123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/неверен/i);
  });

  test('с коротким новым паролем (<6) возвращает 400', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    const res = await agent
      .post('/api/auth/change-password')
      .send({ oldPassword: 'testpass123', newPassword: '12345' });
    expect(res.status).toBe(400);
  });

  test('без oldPassword возвращает 400', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    const res = await agent
      .post('/api/auth/change-password')
      .send({ newPassword: 'newpass123' });
    expect(res.status).toBe(400);
  });

  test('без newPassword возвращает 400', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    const res = await agent
      .post('/api/auth/change-password')
      .send({ oldPassword: 'testpass123' });
    expect(res.status).toBe(400);
  });
});
