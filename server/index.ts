import express from 'express';
import path from 'path';
import catalogRoutes from './routes/route_catalog';

const app = express();
const PORT = 3000;

// Логирование всех запросов для отладки
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== API РОУТЫ ==========
app.use('/api/catalog', catalogRoutes);

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// SPA - все остальные роуты ведут на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
});