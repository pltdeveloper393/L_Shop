const API_BASE = '/api';
async function request(url, options) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}
export const apiDelivery = {
    // Получить все доставки пользователя
    getDeliveries: () => request('/delivery'),
    // Получить доставку по ID
    getDelivery: (id) => request(`/delivery/${id}`),
    // Создать доставку
    createDelivery: (formData) => request('/delivery', {
        method: 'POST',
        body: JSON.stringify(formData),
    }),
    // Отменить доставку
    cancelDelivery: (id) => request(`/delivery/${id}`, {
        method: 'DELETE',
    }),
};
