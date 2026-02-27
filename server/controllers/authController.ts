import { Request, Response } from 'express';
import * as UserModel from '../models/UserModel';
import bcrypt from 'bcrypt';

export async function register(req: Request, res: Response) {
  const { nickname, email, password } = req.body;

  // Простая валидация
  if (!nickname || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Проверка уникальности
    const existingEmail = await UserModel.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingNickname = await UserModel.findUserByNickname(nickname);
    if (existingNickname) {
      return res.status(400).json({ message: 'Nickname already exists' });
    }

    const user = await UserModel.createUser(nickname, email, password);

    // Сохраняем userId в сессии
    req.session.userId = user.id;

    res.status(201).json({ message: 'Registration successful', user: { id: user.id, nickname: user.nickname, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.userId = user.id;

    res.json({ message: 'Login successful', user: { id: user.id, nickname: user.nickname, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getMe(req: Request, res: Response) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const users = await UserModel.readUsers();
    const user = users.find(u => u.id === req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user: { id: user.id, nickname: user.nickname, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logout successful' });
  });
}