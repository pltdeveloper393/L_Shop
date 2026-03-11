import fs from 'fs/promises';
import path from 'path';

const DELIVERIES_FILE = path.join(__dirname, '../../deliveries.json');

export interface DeliveryItem {
  productId: number;
  productName: string;
  productImg: string;
  quantity: number;
  price: number;
}

export interface Delivery {
  id: string;
  userId: string;
  items: DeliveryItem[];
  totalPrice: number;
  address: string;
  phone: string;
  email: string;
  paymentMethod: 'card' | 'cash';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface DeliveryFormData {
  address: string;
  phone: string;
  email: string;
  paymentMethod: 'card' | 'cash';
}

export async function readDeliveries(): Promise<Delivery[]> {
  try {
    const data = await fs.readFile(DELIVERIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function writeDeliveries(deliveries: Delivery[]): Promise<void> {
  await fs.writeFile(DELIVERIES_FILE, JSON.stringify(deliveries, null, 2));
}

export async function getDeliveriesByUserId(userId: string): Promise<Delivery[]> {
  const deliveries = await readDeliveries();
  return deliveries.filter(d => d.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getDeliveryById(id: string): Promise<Delivery | undefined> {
  const deliveries = await readDeliveries();
  return deliveries.find(d => d.id === id);
}

export async function createDelivery(userId: string, formData: DeliveryFormData): Promise<Delivery> {
  const deliveries = await readDeliveries();
  
  // Создаем тестовую доставку с одним товаром (так как корзины нет)
  const deliveryItems: DeliveryItem[] = [
    {
      productId: 1,
      productName: 'Тестовый танк',
      productImg: '/images/tanks/test-tank.png',
      quantity: 1,
      price: 1000
    }
  ];

  const totalPrice = deliveryItems.reduce((total: number, item: DeliveryItem) => total + (item.price * item.quantity), 0);

  const newDelivery: Delivery = {
    id: Date.now().toString(),
    userId,
    items: deliveryItems,
    totalPrice,
    address: formData.address,
    phone: formData.phone,
    email: formData.email,
    paymentMethod: formData.paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  deliveries.push(newDelivery);
  await writeDeliveries(deliveries);
  
  return newDelivery;
}

export async function updateDeliveryStatus(id: string, status: Delivery['status']): Promise<Delivery> {
  const deliveries = await readDeliveries();
  const delivery = deliveries.find(d => d.id === id);
  
  if (!delivery) {
    throw new Error('Доставка не найдена');
  }
  
  delivery.status = status;
  await writeDeliveries(deliveries);
  
  return delivery;
}

export async function cancelDelivery(id: string, userId: string): Promise<Delivery> {
  const deliveries = await readDeliveries();
  const delivery = deliveries.find(d => d.id === id && d.userId === userId);
  
  if (!delivery) {
    throw new Error('Доставка не найдена');
  }
  
  if (delivery.status !== 'pending') {
    throw new Error('Невозможно отменить доставку с текущим статусом');
  }
  
  delivery.status = 'cancelled';
  await writeDeliveries(deliveries);
  
  return delivery;
}