import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import cartRoutes from './routes/route_cart';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const app = express();
const PORT = 3000;

// Логирование всех запросов для отладки
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессии с правильными параметрами
app.use(session({
  secret: 'your-secret-key-wot-shop-2026',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false, 
    maxAge: 10 * 60 * 1000, // 10 минут по ТЗ
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// ========== API РОУТЫ (до static файлов!) ==========
app.use('/api/cart', cartRoutes);

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// SPA - все остальные роуты ведут на index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
});