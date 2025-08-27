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

// Servicio de feria temporal para mantener compatibilidad
export const feriaService = {
  iniciarContacto: async (data: any) => {
    const response = await fetch(`${API_URL}/feria/iniciar-contacto/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  iniciarDiagnosticoContacto: async (data: any) => {
    const response = await fetch(`${API_URL}/feria/iniciar-contacto/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  completarDiagnostico: async (diagnosticId: string, data: any) => {
    const response = await fetch(`${API_URL}/feria/completar-diagnostico/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ diagnosticId, ...data }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  buscarDiagnostico: async (accessCode: string) => {
    const response = await fetch(`${API_URL}/feria/buscar-diagnostico/${accessCode}`, {
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

  obtenerResultados: async (diagnosticoId: string) => {
    const response = await fetch(`${API_URL}/feria/resultados/${diagnosticoId}`, {
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

  getDiagnosticoByCode: async (accessCode: string) => {
    const response = await fetch(`${API_URL}/feria/buscar-diagnostico/${accessCode}`, {
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

  getDiagnosticoById: async (diagnosticoId: string) => {
    const response = await fetch(`${API_URL}/feria/resultados/${diagnosticoId}`, {
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