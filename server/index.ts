import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Базовый роут
app.get('/', (req, res) => {
  res.send('Сервер запущен. Магазин танков в разработке.');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
});