import express from 'express';
import session from 'express-session';
import path from 'path';
import authRoutes from './routes/auth';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// ========== БУДУЩИЕ РОУТЫ ==========
// (Названия первичные, могут отличаться и изменяться)
app.use('/api/auth', authRoutes);

// import catalogRoutes from './routes/catalog';
// import cartRoutes from './routes/cart';
// import deliveryRoutes from './routes/delivery';
//
// app.use('/api/catalog', catalogRoutes);  // для products
// app.use('/api/cart', cartRoutes);        // для cart
// app.use('/api/delivery', deliveryRoutes);// для delivery

app.use(express.static(path.join(__dirname, '../../public')));

// SPA в каркас index.html помещаем
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});