import { API_URL } from '@/config/api';

interface Token {
  access_token: string;
  token_type: string;
}

interface User {
  id: number;
  email: string;
  nombre?: string;
  empresa?: string;
  is_active: boolean;
}

interface UserCreate {
  email: string;
  password: string;
  nombre: string;
  empresa: string;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as unknown as T;
  }

  async login(email: string, password: string): Promise<Token> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      body: formData,
    });

    return this.handleResponse<Token>(response);
  }

  async register(userData: UserCreate): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return this.handleResponse<User>(response);
  }
}

export const authService = new AuthService();
export default authService; 