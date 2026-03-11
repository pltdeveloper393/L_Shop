// Типы для корзины

export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  img?: string;
  level?: number;
  type?: string;
  nation?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface CartResponse {
  cart: Cart | { items: CartItem[] };
  total: number;
  message?: string;
}

export interface CartCountResponse {
  count: number;
}