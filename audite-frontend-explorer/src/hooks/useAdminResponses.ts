import { useState, useEffect } from 'react';
import { 
  AutodiagnosticoRespuestasAdmin, 
  AutodiagnosticoSesionResumen,
  AutodiagnosticoSesion
} from '@/types/autodiagnostico';
import { API } from '@/config/api';

export const useAdminResponses = () => {
  const [respuestas, setRespuestas] = useState<AutodiagnosticoRespuestasAdmin | null>(null);
  const [sesiones, setSesiones] = useState<AutodiagnosticoSesionResumen[]>([]);
  const [sesionDetalle, setSesionDetalle] = useState<AutodiagnosticoSesion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener token de administrador
  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Obtener todas las respuestas con filtros
  const fetchRespuestas = async (filters?: {
    session_id?: string;
    pregunta_id?: number;
    limit?: number;
    offset?: number;
  }) => {
    const token = getAdminToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.session_id) params.append('session_id', filters.session_id);
      if (filters?.pregunta_id) params.append('pregunta_id', filters.pregunta_id.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const url = `${API.autodiagnostico.admin.respuestas}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las respuestas');
      }

      const data = await response.json();
      setRespuestas(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener resumen de sesiones únicas
  const fetchSesionesResumen = async () => {
    const token = getAdminToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Primero obtener el número total de preguntas activas
      const preguntasResponse = await fetch(API.autodiagnostico.preguntas);
      if (!preguntasResponse.ok) {
        throw new Error('Error al obtener las preguntas');
      }
      const preguntasData = await preguntasResponse.json();
      const totalPreguntasActivas = preguntasData.length;

      // Luego obtener las respuestas
      const response = await fetch(API.autodiagnostico.admin.respuestas, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las sesiones');
      }

      const data = await response.json();
      
      // Procesar respuestas para crear resumen de sesiones
      const sesionesMap = new Map<string, AutodiagnosticoSesionResumen>();
      
      data.respuestas.forEach((respuesta: any) => {
        const sessionId = respuesta.session_id;
        
        if (!sesionesMap.has(sessionId)) {
          sesionesMap.set(sessionId, {
            session_id: sessionId,
            total_respuestas: 1,
            fecha_inicio: respuesta.created_at,
            fecha_ultima_respuesta: respuesta.created_at,
            completado: false, // Se calculará después
            ip_address: respuesta.ip_address,
            user_agent: respuesta.user_agent,
          });
        } else {
          const sesion = sesionesMap.get(sessionId)!;
          sesion.total_respuestas++;
          
          // Actualizar fechas
          if (new Date(respuesta.created_at) < new Date(sesion.fecha_inicio)) {
            sesion.fecha_inicio = respuesta.created_at;
          }
          if (new Date(respuesta.created_at) > new Date(sesion.fecha_ultima_respuesta)) {
            sesion.fecha_ultima_respuesta = respuesta.created_at;
          }
        }
      });

      // Calcular si cada sesión está completa
      const sesionesArray = Array.from(sesionesMap.values()).map(sesion => ({
        ...sesion,
        completado: sesion.total_respuestas >= totalPreguntasActivas
      }));

      setSesiones(sesionesArray);
      return sesionesArray;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener detalles de una sesión específica
  const fetchSesionDetalle = async (sessionId: string) => {
    const token = getAdminToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Usar el endpoint público de sesión (no requiere autenticación)
      const response = await fetch(API.autodiagnostico.sesion(sessionId));

      if (!response.ok) {
        throw new Error('Error al obtener los detalles de la sesión');
      }

      const data = await response.json();
      setSesionDetalle(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar estado
  const clearState = () => {
    setRespuestas(null);
    setSesiones([]);
    setSesionDetalle(null);
    setError(null);
  };

  return {
    respuestas,
    sesiones,
    sesionDetalle,
    loading,
    error,
    fetchRespuestas,
    fetchSesionesResumen,
    fetchSesionDetalle,
    clearState,
  };
}; 