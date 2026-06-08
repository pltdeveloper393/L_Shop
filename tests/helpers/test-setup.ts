import fs from 'fs/promises';
import path from 'path';

const TANKS_FILE = path.join(__dirname, '../../tanks.json');
const USERS_FILE = path.join(__dirname, '../../users.json');
const CARTS_FILE = path.join(__dirname, '../../carts.json');
const DELIVERIES_FILE = path.join(__dirname, '../../deliveries.json');
const REVIEWS_FILE = path.join(__dirname, '../../reviews.json');

let tanksBackup: string | null = null;
let usersBackup: string | null = null;
let cartsBackup: string | null = null;
let deliveriesBackup: string | null = null;
let reviewsBackup: string | null = null;

export async function backupData(): Promise<void> {
  tanksBackup = await fs.readFile(TANKS_FILE, 'utf-8').catch(() => null);
  usersBackup = await fs.readFile(USERS_FILE, 'utf-8').catch(() => null);
  cartsBackup = await fs.readFile(CARTS_FILE, 'utf-8').catch(() => null);
  deliveriesBackup = await fs.readFile(DELIVERIES_FILE, 'utf-8').catch(() => null);
  reviewsBackup = await fs.readFile(REVIEWS_FILE, 'utf-8').catch(() => null);
}

export async function restoreData(): Promise<void> {
  if (tanksBackup !== null) await fs.writeFile(TANKS_FILE, tanksBackup, 'utf-8');
  if (usersBackup !== null) await fs.writeFile(USERS_FILE, usersBackup, 'utf-8');
  if (cartsBackup !== null) await fs.writeFile(CARTS_FILE, cartsBackup, 'utf-8');
  if (deliveriesBackup !== null) await fs.writeFile(DELIVERIES_FILE, deliveriesBackup, 'utf-8');
  if (reviewsBackup !== null) await fs.writeFile(REVIEWS_FILE, reviewsBackup, 'utf-8');
}
