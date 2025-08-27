import { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';

export interface AdminPregunta {
  id: number;
  numero_orden: number;
  pregunta: string;
  tipo_respuesta: 'radio' | 'checkbox' | 'text' | 'number' | 'select';
  es_activa: boolean;
  created_at: string;
  updated_at: string;
  opciones: AdminOpcion[];
}

export interface AdminOpcion {
  id: number;
  pregunta_id: number;
  texto_opcion: string;
  valor: string;
  es_por_defecto: boolean;
  es_especial: boolean;
  orden: number;
  es_activa: boolean;
  tiene_sugerencia: boolean;
  sugerencia?: string;
  created_at: string;
}

export interface CreatePreguntaData {
  numero_orden: number;
  pregunta: string;
  tipo_respuesta: 'radio' | 'checkbox' | 'text' | 'number' | 'select';
  es_activa: boolean;
  opciones: CreateOpcionData[];
}

export interface CreateOpcionData {
  texto_opcion: string;
  valor: string;
  orden: number;
  es_especial: boolean;
  tiene_sugerencia?: boolean;
  sugerencia?: string;
}

export const useAdminQuestions = () => {
  const [preguntas, setPreguntas] = useState<AdminPregunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchPreguntas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/autodiagnostico/admin/preguntas`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al cargar las preguntas');
      }

      const data = await response.json();
      setPreguntas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createPregunta = async (data: CreatePreguntaData): Promise<AdminPregunta> => {
    setError(null);
    const response = await fetch(`${API_URL}/autodiagnostico/admin/preguntas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al crear la pregunta');
    }

    const newPregunta = await response.json();
    setPreguntas(prev => [...prev, newPregunta]);
    return newPregunta;
  };

  const updatePregunta = async (id: number, data: Partial<CreatePreguntaData>): Promise<AdminPregunta> => {
    setError(null);
    const response = await fetch(`${API_URL}/autodiagnostico/admin/preguntas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al actualizar la pregunta');
    }

    const updatedPregunta = await response.json();
    setPreguntas(prev => prev.map(p => p.id === id ? updatedPregunta : p));
    return updatedPregunta;
  };

  const deletePregunta = async (id: number): Promise<void> => {
    setError(null);
    const response = await fetch(`${API_URL}/autodiagnostico/admin/preguntas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al eliminar la pregunta');
    }

    setPreguntas(prev => prev.filter(p => p.id !== id));
  };

  const togglePreguntaActiva = async (id: number, activa: boolean): Promise<void> => {
    await updatePregunta(id, { es_activa: activa });
  };

  const getEstadisticas = async () => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/autodiagnostico/admin/estadisticas`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al cargar las estadísticas');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  useEffect(() => {
    fetchPreguntas();
  }, []);

  return {
    preguntas,
    loading,
    error,
    fetchPreguntas,
    createPregunta,
    updatePregunta,
    deletePregunta,
    togglePreguntaActiva,
    getEstadisticas
  };
}; 