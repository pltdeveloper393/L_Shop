export interface User {
  id: string;
  nickname: string;
  email: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
}