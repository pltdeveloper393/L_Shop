export interface User {
  id: string;
  nickname: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
}