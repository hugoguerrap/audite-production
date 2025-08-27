import { API_URL } from '@/config/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Si es 401, limpiar token y redirigir a login
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminExpiresAt');
        window.location.href = '/admin';
        throw new Error('Sesión expirada');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as unknown as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // Métodos específicos de admin
  async adminLogin(credentials: { username: string; password: string }) {
    return this.post('/admin/auth/login', credentials);
  }

  async verifyAdminToken() {
    return this.post('/admin/auth/verify');
  }

  async refreshAdminToken() {
    return this.post('/admin/auth/refresh');
  }

  // Autodiagnóstico - Admin endpoints
  async getAdminPreguntas() {
    return this.get('/autodiagnostico/admin/preguntas');
  }

  async createAdminPregunta(data: any) {
    return this.post('/autodiagnostico/admin/preguntas', data);
  }

  async updateAdminPregunta(id: number, data: any) {
    return this.put(`/autodiagnostico/admin/preguntas/${id}`, data);
  }

  async deleteAdminPregunta(id: number) {
    return this.delete(`/autodiagnostico/admin/preguntas/${id}`);
  }

  async getAdminEstadisticas() {
    return this.get('/autodiagnostico/admin/estadisticas');
  }

  async getAdminRespuestas(params?: { session_id?: string; pregunta_id?: number; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.session_id) searchParams.append('session_id', params.session_id);
    if (params?.pregunta_id) searchParams.append('pregunta_id', params.pregunta_id.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const queryString = searchParams.toString();
    return this.get(`/autodiagnostico/admin/respuestas${queryString ? `?${queryString}` : ''}`);
  }

  // Autodiagnóstico - Public endpoints
  async getPreguntas() {
    return this.get('/autodiagnostico/preguntas');
  }

  async enviarRespuestas(data: any) {
    return this.post('/autodiagnostico/responder', data);
  }

  async getSugerencias(sessionId: string) {
    return this.get(`/autodiagnostico/sugerencias/${sessionId}`);
  }

  async getSesion(sessionId: string) {
    return this.get(`/autodiagnostico/sesion/${sessionId}`);
  }

  async getSesionCompleta(sessionId: string) {
    return this.get(`/autodiagnostico/sesion/${sessionId}/completa`);
  }
}

export const apiService = new ApiService();
export default apiService;
