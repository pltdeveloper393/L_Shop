import request from 'supertest';
import app from '../../server/app';
import * as ProductModel from '../../server/models/ProductModel_catalog';
import * as UserModel from '../../server/models/UserModel';

let firstProductId: number;
let adminAgent: request.Agent;
const adminNick = 'test_admin_' + Date.now();
const adminEmail = `test_admin_${Date.now()}@test.com`;
const adminPass = 'adminpass123';

beforeAll(async () => {
  // Get first product ID dynamically
  const products = await ProductModel.getAllProducts();
  firstProductId = products[0]?.id || 3;

  // Register a user and promote to admin
  const user = await UserModel.createUser(adminNick, adminEmail, adminPass);
  await UserModel.updateUserRole(user.id, 'admin');

  // Login as admin
  adminAgent = request.agent(app);
  await adminAgent.post('/api/auth/login').send({ email: adminEmail, password: adminPass });
});

afterAll(async () => {
  // Cleanup: remove test admin
  const users = await UserModel.readUsers();
  const filtered = users.filter(u => u.nickname !== adminNick);
  await UserModel.writeUsers(filtered);
});

describe('GET /api/catalog — список товаров', () => {
  test('без фильтров возвращает массив товаров', async () => {
    const res = await request(app).get('/api/catalog');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  test('в каждом товаре есть обязательные поля', async () => {
    const res = await request(app).get('/api/catalog');
    const product = res.body.products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('nation');
    expect(product).toHaveProperty('type');
    expect(product).toHaveProperty('level');
    expect(product).toHaveProperty('inStock');
  });

  test('фильтр search по названию', async () => {
    const res = await request(app).get('/api/catalog?search=объект');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    res.body.products.forEach((p: any) => {
      expect(p.name.toLowerCase()).toContain('объект');
    });
  });

  test('фильтр search без совпадений возвращает пустой массив', async () => {
    const res = await request(app).get('/api/catalog?search=xyznonexistent12345');
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });

  test('фильтр nation', async () => {
    const res = await request(app).get('/api/catalog?nation=ussr');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    res.body.products.forEach((p: any) => {
      expect(p.nation).toBe('ussr');
    });
  });

  test('фильтр type', async () => {
    const res = await request(app).get('/api/catalog?type=heavy');
    expect(res.status).toBe(200);
    res.body.products.forEach((p: any) => {
      expect(p.type).toBe('heavy');
    });
  });

  test('фильтр level', async () => {
    const res = await request(app).get('/api/catalog?level=10');
    expect(res.status).toBe(200);
    res.body.products.forEach((p: any) => {
      expect(p.level).toBe(10);
    });
  });

  test('фильтр inStock=true возвращает только товары в наличии', async () => {
    const res = await request(app).get('/api/catalog?inStock=true');
    expect(res.status).toBe(200);
    res.body.products.forEach((p: any) => {
      expect(p.inStock).toBe(true);
    });
  });

  test('фильтр inStock=false возвращает только товары не в наличии', async () => {
    const res = await request(app).get('/api/catalog?inStock=false');
    expect(res.status).toBe(200);
    res.body.products.forEach((p: any) => {
      expect(p.inStock).toBe(false);
    });
  });

  test('сортировка price-asc', async () => {
    const res = await request(app).get('/api/catalog?sortBy=price-asc');
    expect(res.status).toBe(200);
    const prices = res.body.products.map((p: any) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('сортировка price-desc', async () => {
    const res = await request(app).get('/api/catalog?sortBy=price-desc');
    expect(res.status).toBe(200);
    const prices = res.body.products.map((p: any) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
    }
  });

  test('комбинация nation + type + level', async () => {
    const res = await request(app).get('/api/catalog?nation=ussr&type=heavy&level=10');
    expect(res.status).toBe(200);
    if (res.body.products.length > 0) {
      res.body.products.forEach((p: any) => {
        expect(p.nation).toBe('ussr');
        expect(p.type).toBe('heavy');
        expect(p.level).toBe(10);
      });
    }
  });

  test('неизвестный параметр не вызывает ошибку', async () => {
    const res = await request(app).get('/api/catalog?unknownParam=value&x=y');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/catalog/filters', () => {
  test('возвращает объект filters с nations, types, levels', async () => {
    const res = await request(app).get('/api/catalog/filters');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('filters');
    expect(res.body.filters).toHaveProperty('nations');
    expect(res.body.filters).toHaveProperty('types');
    expect(res.body.filters).toHaveProperty('levels');
    expect(Array.isArray(res.body.filters.nations)).toBe(true);
    expect(Array.isArray(res.body.filters.types)).toBe(true);
    expect(Array.isArray(res.body.filters.levels)).toBe(true);
    expect(res.body.filters.nations.length).toBeGreaterThan(0);
  });
});

describe('GET /api/catalog/search', () => {
  test('поиск с параметром q возвращает результаты', async () => {
    const res = await request(app).get('/api/catalog/search?q=объект');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  test('поиск без q возвращает 400', async () => {
    const res = await request(app).get('/api/catalog/search');
    expect(res.status).toBe(400);
  });

  test('поиск с пустым q возвращает 400', async () => {
    const res = await request(app).get('/api/catalog/search?q=');
    expect(res.status).toBe(400);
  });

  test('поиск по несуществующему слову возвращает пустой массив', async () => {
    const res = await request(app).get('/api/catalog/search?q=zzzznonexistent');
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });

  test('поиск со спецсимволами не вызывает ошибку', async () => {
    const res = await request(app).get('/api/catalog/search?q=%24%5E%26*');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/catalog/:id — получение товара по ID', () => {
  test('существующий товар возвращается с данными', async () => {
    const res = await request(app).get(`/api/catalog/${firstProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.product).toHaveProperty('id', firstProductId);
  });

  test('несуществующий id возвращает 404', async () => {
    const res = await request(app).get('/api/catalog/99999');
    expect(res.status).toBe(404);
  });

  test('id = 0 возвращает 404 (невалидный)', async () => {
    const res = await request(app).get('/api/catalog/0');
    expect(res.status).toBe(404);
  });

  test('id = -1 возвращает 404', async () => {
    const res = await request(app).get('/api/catalog/-1');
    expect(res.status).toBe(404);
  });

  test('id = abc возвращает 400 (некорректный ID)', async () => {
    const res = await request(app).get('/api/catalog/abc');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/catalog — создание товара (admin)', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app)
      .post('/api/catalog')
      .field('name', 'Test Tank')
      .field('nation', 'ussr')
      .field('type', 'heavy')
      .field('level', '10')
      .field('price', '5000');
    expect(res.status).toBe(401);
  });

  test('создание без обязательных полей возвращает 400', async () => {
    const res = await adminAgent
      .post('/api/catalog')
      .field('name', '');
    expect(res.status).toBe(400);
  });

  test('создание с валидными данными возвращает 201', async () => {
    const res = await adminAgent
      .post('/api/catalog')
      .field('name', 'Test Tank ' + Date.now())
      .field('nation', 'ussr')
      .field('type', 'heavy')
      .field('level', '8')
      .field('price', '5000')
      .field('inStock', 'true');
    expect(res.status).toBe(201);
    expect(res.body.product).toHaveProperty('id');
    expect(res.body.product.name).toContain('Test Tank');
  });
});

describe('DELETE /api/catalog/:id/image — удаление фото (admin)', () => {
  test('без авторизации возвращает 401', async () => {
    const res = await request(app).delete(`/api/catalog/${firstProductId}/image`);
    expect(res.status).toBe(401);
  });

  test('некорректный ID возвращает 400', async () => {
    const res = await adminAgent.delete('/api/catalog/abc/image');
    expect(res.status).toBe(400);
  });

  test('несуществующий товар возвращает 404', async () => {
    const res = await adminAgent.delete('/api/catalog/99999/image');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/catalog/recommended — рекомендации', () => {
  test('без авторизации возвращает пустой массив', async () => {
    const res = await request(app).get('/api/catalog/recommended');
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
  });
});
