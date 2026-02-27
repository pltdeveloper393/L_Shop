import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const USERS_FILE = path.join(__dirname, '../../users.json');

export interface User {
  id: string;
  nickname: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty array
    return [];
  }
}

export async function writeUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(u => u.email === email);
}

export async function findUserByNickname(nickname: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(u => u.nickname === nickname);
}

export async function createUser(nickname: string, email: string, password: string): Promise<User> {
  const users = await readUsers();
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: Date.now().toString(),
    nickname,
    email,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  await writeUsers(users);
  return newUser;
}