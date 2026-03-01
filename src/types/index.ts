export interface User {
  id: string;
  nickname: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
}