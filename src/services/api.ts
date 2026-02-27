const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export const api = {
  // ==============================================================
  // Методы Auth-ветки:
  register: (nickname: string, email: string, password: string) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nickname, email, password })
    }),
  
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  getMe: () => request('/auth/me'),
  
  logout: () => request('/auth/logout', { method: 'POST' }),
  // ==============================================================
  
  // ========== ДОПИСАТЬ!!! ==========
  // Ниже будущие методы других частей

  //Примеры:
  // getTanks: () => request('/catalog'),
  // getTankById: (id) => request(`/catalog/${id}`),
  
  // getCart: () => request('/cart'),
  // addToCart: (productId) => request('/cart', { method: 'POST', body: JSON.stringify({ productId }) }),
  
  // getDeliveryMethods: () => request('/delivery'),
  // createOrder: (data) => request('/delivery/order', { method: 'POST', body: JSON.stringify(data) })
};