import { API_URL } from '@/config/api';
import type { 
  AuditoriaBasica, 
  AuditoriaBasicaCreate, 
  AuditoriaAgro,
  AuditoriaAgroCreate,
  AuditoriaAgroUpdate,
  AgroIndustryType,
  AgroEquipment,
  AgroProcess
} from '@/types/api';

// Servicios temporales para mantener compatibilidad con componentes existentes
// TODO: Migrar estos servicios al nuevo sistema de autenticación cuando sea necesario

class LegacyApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('audite_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
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
    
    return response.text() as any;
  }

  // Basic Audit Service
  async getBasicAudits(): Promise<AuditoriaBasica[]> {
    const response = await fetch(`${this.baseUrl}/auditoria-basica/`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AuditoriaBasica[]>(response);
  }

  async getBasicAuditById(id: number): Promise<AuditoriaBasica> {
    const response = await fetch(`${this.baseUrl}/auditoria-basica/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AuditoriaBasica>(response);
  }

  async createBasicAudit(data: AuditoriaBasicaCreate): Promise<AuditoriaBasica> {
    const response = await fetch(`${this.baseUrl}/auditoria-basica/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuditoriaBasica>(response);
  }

  async updateBasicAudit(id: number, data: Partial<AuditoriaBasicaCreate>): Promise<AuditoriaBasica> {
    const response = await fetch(`${this.baseUrl}/auditoria-basica/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuditoriaBasica>(response);
  }

  async deleteBasicAudit(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auditoria-basica/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  // Agro Audit Service
  async getAgroAudits(): Promise<AuditoriaAgro[]> {
    const response = await fetch(`${this.baseUrl}/auditoria-agro/`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AuditoriaAgro[]>(response);
  }

  async getAgroAuditById(id: number): Promise<AuditoriaAgro> {
    const response = await fetch(`${this.baseUrl}/auditoria-agro/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AuditoriaAgro>(response);
  }

  async createAgroAudit(data: AuditoriaAgroCreate): Promise<AuditoriaAgro> {
    const response = await fetch(`${this.baseUrl}/auditoria-agro/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuditoriaAgro>(response);
  }

  async updateAgroAudit(id: number, data: AuditoriaAgroUpdate): Promise<AuditoriaAgro> {
    const response = await fetch(`${this.baseUrl}/auditoria-agro/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<AuditoriaAgro>(response);
  }

  async deleteAgroAudit(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auditoria-agro/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  // Agro Data Service
  async getIndustryTypes(): Promise<AgroIndustryType[]> {
    const response = await fetch(`${this.baseUrl}/agro-data/industry-types`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AgroIndustryType[]>(response);
  }

  async getEquipment(): Promise<AgroEquipment[]> {
    const response = await fetch(`${this.baseUrl}/agro-data/equipment`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AgroEquipment[]>(response);
  }

  async getProcesses(): Promise<AgroProcess[]> {
    const response = await fetch(`${this.baseUrl}/agro-data/processes`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AgroProcess[]>(response);
  }
}

const legacyApiService = new LegacyApiService();

// Exportar servicios individuales para mantener compatibilidad
export const basicAuditService = {
  getAll: () => legacyApiService.getBasicAudits(),
  getById: (id: number) => legacyApiService.getBasicAuditById(id),
  create: (data: AuditoriaBasicaCreate) => legacyApiService.createBasicAudit(data),
  update: (id: number, data: Partial<AuditoriaBasicaCreate>) => legacyApiService.updateBasicAudit(id, data),
  delete: (id: number) => legacyApiService.deleteBasicAudit(id),
};

export const agroAuditService = {
  getAll: () => legacyApiService.getAgroAudits(),
  getById: (id: number) => legacyApiService.getAgroAuditById(id),
  create: (data: AuditoriaAgroCreate) => legacyApiService.createAgroAudit(data),
  update: (id: number, data: AuditoriaAgroUpdate) => legacyApiService.updateAgroAudit(id, data),
  delete: (id: number) => legacyApiService.deleteAgroAudit(id),
};

export const agroDataService = {
  getIndustryTypes: () => legacyApiService.getIndustryTypes(),
  getEquipment: () => legacyApiService.getEquipment(),
  getProcesses: () => legacyApiService.getProcesses(),
};

// Servicio de feria adaptado para usar autodiagnóstico backend
export const feriaService = {
  // Genera un session ID único para cada diagnóstico
  generateSessionId: () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback para navegadores que no soportan crypto.randomUUID
    return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) + '-' + Date.now();
  },

  iniciarContacto: async (_data: any) => {
    // Genera un session ID para el nuevo diagnóstico
    const sessionId = feriaService.generateSessionId();
    
    // Adaptar los datos de contacto para el formato del autodiagnóstico
    // Por ahora, simplemente devolvemos un ID y código de acceso mock
    return {
      id: sessionId,
      accessCode: sessionId.substring(0, 8).toUpperCase(),
      sessionId: sessionId
    };
  },

  iniciarDiagnosticoContacto: async (_data: any) => {
    // Similar al método anterior
    const sessionId = feriaService.generateSessionId();
    
    return {
      id: sessionId,
      accessCode: sessionId.substring(0, 8).toUpperCase(),
      sessionId: sessionId
    };
  },

  completarDiagnostico: async (sessionId: string, data: any) => {
    // Adaptar los datos del formulario al formato del autodiagnóstico
    const adaptedResponses: any[] = [];
    
    // Mapear los datos del formulario de feria a respuestas de autodiagnóstico
    if (data.background) {
      adaptedResponses.push({
        pregunta_id: 1, // Tamaño de empresa
        respuesta: data.background.mainInterest === 'cost_reduction' ? 'grande' : 'pequena',
        valor_numerico: null
      });
    }
    
    if (data.production) {
      adaptedResponses.push({
        pregunta_id: 2, // Sector industrial
        respuesta: data.production.productType || 'alimentario',
        valor_numerico: null
      });
    }
    
    // Realizar la llamada al autodiagnóstico
    const response = await fetch(`${API_URL}/autodiagnostico/responder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        respuestas: adaptedResponses
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Obtener sugerencias
    try {
      const suggestionsResponse = await fetch(`${API_URL}/autodiagnostico/sugerencias/${sessionId}`);
      if (suggestionsResponse.ok) {
        const suggestions = await suggestionsResponse.json();
        result.sugerencias = suggestions;
      }
    } catch (error) {
      console.warn('No se pudieron obtener sugerencias:', error);
    }
    
    return result;
  },

  buscarDiagnostico: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/autodiagnostico/sesion/${sessionId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  obtenerResultados: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/autodiagnostico/sesion/${sessionId}/completa`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  getDiagnosticoByCode: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/autodiagnostico/sesion/${sessionId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  getDiagnosticoById: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/autodiagnostico/sesion/${sessionId}/completa`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
};

export default legacyApiService; 