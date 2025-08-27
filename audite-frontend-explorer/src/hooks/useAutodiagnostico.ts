import { useState, useEffect } from 'react';
import { 
  AutodiagnosticoPregunta, 
  AutodiagnosticoRespuesta, 
  AutodiagnosticoFormData,
  AutodiagnosticoSesion,
  AutodiagnosticoSugerencia,
  AutodiagnosticoResultadosConSugerencias,
  OrderingResponse
} from '@/types/autodiagnostico';
import { API } from '@/config/api';

export const useAutodiagnostico = () => {
  const [preguntas, setPreguntas] = useState<AutodiagnosticoPregunta[]>([]);
  const [respuestas, setRespuestas] = useState<AutodiagnosticoFormData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sesionCompleta, setSesionCompleta] = useState<AutodiagnosticoSesion | null>(null);
  const [sugerencias, setSugerencias] = useState<AutodiagnosticoSugerencia[]>([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);

  // Generar session ID único
  const generateSessionId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback para navegadores que no soportan crypto.randomUUID
    return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) + '-' + Date.now();
  };

  // Cargar preguntas del backend
  const fetchPreguntas = async () => {
    try {
      setLoading(true);
      const response = await fetch(API.autodiagnostico.preguntas);
      if (!response.ok) {
        throw new Error('Error al cargar las preguntas');
      }
      const data = await response.json();
      setPreguntas(data);
      // Solo generar sessionId si no existe uno
      if (!sessionId) {
        setSessionId(generateSessionId());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Guardar respuesta individual
  const saveRespuesta = (preguntaId: number, valor: string | number | string[] | OrderingResponse) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  // Enviar respuestas al backend
  const submitRespuestas = async (respuestasToSubmit?: AutodiagnosticoRespuesta[]) => {
    if (!sessionId) return null;

    try {
      setLoading(true);
      
      const respuestasParaEnviar = respuestasToSubmit || Object.entries(respuestas).map(([preguntaId, valor]) => {
        const pregunta = preguntas.find(p => p.id === parseInt(preguntaId));
        if (!pregunta) return null;

        const respuesta: AutodiagnosticoRespuesta = {
          session_id: sessionId,
          pregunta_id: parseInt(preguntaId),
        };

        // Mapear tipos de respuesta del backend a tipos del frontend
        const tipoMapeado = pregunta.tipo_respuesta === 'seleccion_unica' ? 'radio' :
                           pregunta.tipo_respuesta === 'seleccion_multiple' ? 'checkbox' :
                           pregunta.tipo_respuesta === 'texto' ? 'text' :
                           pregunta.tipo_respuesta === 'numero' ? 'number' :
                           pregunta.tipo_respuesta;

        switch (tipoMapeado) {
          case 'radio':
          case 'select':
            respuesta.opcion_seleccionada = valor as string;
            break;
          case 'checkbox':
            respuesta.opciones_seleccionadas = valor as string[];
            break;
          case 'text':
            respuesta.respuesta_texto = valor as string;
            break;
          case 'number':
            respuesta.respuesta_numero = valor as number;
            break;
          case 'ordering':
            respuesta.respuesta_texto = JSON.stringify(valor);
            break;
        }

        return respuesta;
      }).filter(Boolean) as AutodiagnosticoRespuesta[];

      const payload = {
        respuestas: respuestasParaEnviar
      };

      const response = await fetch(API.autodiagnostico.responder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al enviar las respuestas');
      }

      const result = await response.json();
      
      console.log('Respuesta del backend:', result);
      console.log('SessionId enviado:', sessionId);
      console.log('SessionId recibido:', result.session_id);
      
      // Actualizar el sessionId con el valor real del backend
      if (result.session_id && result.session_id !== sessionId) {
        console.log('Actualizando sessionId de', sessionId, 'a', result.session_id);
        setSessionId(result.session_id);
      }
      
      return result.session_id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Obtener sesión completa (simplificado - ya no es necesario)
  const fetchSesion = async (sessionIdToFetch: string) => {
    // Función simplificada que ya no hace llamadas al backend
    return {
      session_id: sessionIdToFetch,
      completado: true,
      created_at: new Date().toISOString(),
      total_preguntas: preguntas.length,
      preguntas_respondidas: preguntas.length,
      respuestas: []
    };
  };

  // Obtener sugerencias de una sesión
  const fetchSugerencias = async (sessionIdToFetch: string) => {
    try {
      setLoadingSugerencias(true);
      const response = await fetch(API.autodiagnostico.sugerencias(sessionIdToFetch));
      if (!response.ok) {
        throw new Error('Error al obtener las sugerencias');
      }
      const data = await response.json();
      setSugerencias(data.sugerencias || []);
      return data.sugerencias || [];
    } catch (err) {
      console.error('Error al obtener sugerencias:', err);
      setSugerencias([]);
      return [];
    } finally {
      setLoadingSugerencias(false);
    }
  };

  // Obtener sesión completa con sugerencias
  const fetchSesionCompleta = async (sessionIdToFetch: string) => {
    try {
      setLoading(true);
      const response = await fetch(API.autodiagnostico.sesionCompleta(sessionIdToFetch));
      if (!response.ok) {
        throw new Error('Error al obtener la sesión completa');
      }
      const data: AutodiagnosticoResultadosConSugerencias = await response.json();
      setSugerencias(data.sugerencias || []);
      return data;
    } catch (err) {
      console.error('Error al obtener sesión completa:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Enviar respuesta individual (para formulario paso a paso)
  const submitSingleRespuesta = async (preguntaId: number, valor: string | number | string[] | OrderingResponse) => {
    const pregunta = preguntas.find(p => p.id === preguntaId);
    if (!pregunta) return false;

    const respuesta: AutodiagnosticoRespuesta = {
      session_id: sessionId,
      pregunta_id: preguntaId,
    };

    switch (pregunta.tipo_respuesta) {
      case 'radio':
      case 'select':
        respuesta.opcion_seleccionada = valor as string;
        break;
      case 'checkbox':
        respuesta.opciones_seleccionadas = valor as string[];
        break;
      case 'text':
        respuesta.respuesta_texto = valor as string;
        break;
      case 'number':
        respuesta.respuesta_numero = valor as number;
        break;
      case 'ordering':
        respuesta.respuesta_texto = JSON.stringify(valor);
        break;
    }

    const result = await submitRespuestas([respuesta]);
    
    // Actualizar sessionId si es necesario
    if (result && result !== sessionId) {
      setSessionId(result);
    }
    
    return result !== null;
  };

  // Navegar entre pasos
  const nextStep = () => {
    if (currentStep < preguntas.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < preguntas.length) {
      setCurrentStep(step);
    }
  };

  // Reset del formulario
  const resetForm = () => {
    setRespuestas({});
    setCurrentStep(0);
    setSessionId(generateSessionId());
    setSesionCompleta(null);
    setSugerencias([]);
    setError(null);
  };

  // Inicializar sessionId y cargar preguntas al montar el componente
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
    fetchPreguntas();
  }, []);

  // Validar respuesta actual
  const isCurrentStepValid = () => {
    const currentPregunta = preguntas[currentStep];
    if (!currentPregunta) return false;
    
    const respuesta = respuestas[currentPregunta.id];
    
    if (currentPregunta.es_obligatoria) {
      if (currentPregunta.tipo_respuesta === 'checkbox') {
        return Array.isArray(respuesta) && respuesta.length > 0;
      }
      if (respuesta === undefined || respuesta === null || respuesta === '') {
        return false;
      }
    }
    
    // Validación específica para email
    if (currentPregunta.pregunta.toLowerCase().includes('email') && 
        typeof respuesta === 'string' && respuesta.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(respuesta);
    }
    
    return true;
  };

  return {
    preguntas,
    respuestas,
    currentStep,
    sessionId,
    loading,
    error,
    sesionCompleta,
    sugerencias,
    loadingSugerencias,
    saveRespuesta,
    submitRespuestas,
    submitSingleRespuesta,
    fetchSesion,
    fetchSugerencias,
    fetchSesionCompleta,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    isCurrentStepValid,
    isComplete: currentStep >= preguntas.length - 1,
    progress: preguntas.length > 0 ? ((currentStep + 1) / preguntas.length) * 100 : 0,
  };
}; 