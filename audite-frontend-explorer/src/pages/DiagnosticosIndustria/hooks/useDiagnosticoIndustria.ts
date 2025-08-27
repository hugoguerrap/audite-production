/**
 * Hook principal para diagnósticos energéticos por industria
 * Maneja el flujo completo: categorías, formularios, preguntas y sugerencias
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  UseDiagnosticoIndustriaState, 
  FormularioIndustria, 
  PreguntaCondicional,
  RespuestaConOtro,
  SugerenciasResponse,
  ErrorValidacion,
  EnvioRespuestasRequest,
  RespuestaFormularioCreate
} from '@/types/industria';
import { API } from '@/config/api';
import { filtrarPreguntasVisibles } from '../utils/conditionalLogic';
import { validarFormulario, calcularPorcentajeCompletitud } from '../utils/formValidation';

export const useDiagnosticoIndustria = () => {
  const [state, setState] = useState<UseDiagnosticoIndustriaState>({
    // Estado de categorías
    categorias: [],
    cargandoCategorias: false,
    
    // Estado de formularios
    formularios: [],
    cargandoFormularios: false,
    
    // Estado de preguntas
    preguntas: [],
    preguntasVisibles: [],
    cargandoPreguntas: false,
    
    // Estado de respuestas
    respuestas: {},
    sessionId: '',
    enviandoRespuestas: false,
    
    // Estado de progreso
    progreso: {
      paso_actual: 0,
      total_pasos: 0,
      porcentaje: 0,
      preguntas_respondidas: 0,
      preguntas_visibles: 0
    },
    estadoFormulario: 'no_iniciado',
    
    // Estado de sugerencias
    cargandoSugerencias: false,
    
    // Estado de errores
    erroresValidacion: []
  });

  // Generar sessionId único
  const generarSessionId = useCallback(() => {
    return `industria_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Función para cargar formularios por categoría
  const fetchFormularios = useCallback(async (categoriaId: number) => {
    try {
      setState(prev => ({ ...prev, cargandoFormularios: true, error: undefined }));

      const response = await fetch(API.diagnosticoIndustria.formularios(categoriaId));
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const formularios: FormularioIndustria[] = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        formularios,
        cargandoFormularios: false 
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar formularios';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        cargandoFormularios: false 
      }));
      console.error('Error fetchFormularios:', err);
    }
  }, []);

  // Función para cargar preguntas con lógica condicional
  const fetchPreguntas = useCallback(async (formularioId: number, respuestasActuales = {}) => {
    try {
      setState(prev => ({ ...prev, cargandoPreguntas: true, error: undefined }));

      // Construir query params para respuestas actuales si existen
      const queryParams = Object.keys(respuestasActuales).length > 0 
        ? `?respuestas_actuales=${encodeURIComponent(JSON.stringify(respuestasActuales))}`
        : '';

      const response = await fetch(`${API.diagnosticoIndustria.preguntas(formularioId)}${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const preguntas: PreguntaCondicional[] = await response.json();
      
      // Filtrar preguntas visibles con lógica condicional
      const preguntasVisibles = filtrarPreguntasVisibles(preguntas, respuestasActuales);
      
      setState(prev => ({ 
        ...prev, 
        preguntas,
        preguntasVisibles,
        cargandoPreguntas: false,
        progreso: {
          ...prev.progreso,
          total_pasos: preguntasVisibles.length,
          preguntas_visibles: preguntasVisibles.length
        }
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar preguntas';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        cargandoPreguntas: false 
      }));
      console.error('Error fetchPreguntas:', err);
    }
  }, []);

  // Función para guardar respuesta individual
  const saveRespuesta = useCallback((preguntaId: number, valor: any, valorOtro?: string) => {
    setState(prev => {
      const nuevasRespuestas = {
        ...prev.respuestas,
        [preguntaId]: { valor, otro: valorOtro }
      };

      // Recalcular preguntas visibles con nuevas respuestas
      const respuestasSimples = Object.fromEntries(
        Object.entries(nuevasRespuestas).map(([id, resp]) => [parseInt(id), resp.valor])
      );
      const preguntasVisibles = filtrarPreguntasVisibles(prev.preguntas, respuestasSimples);
      
      // Calcular progreso
      const preguntasRespondidas = Object.keys(nuevasRespuestas).length;
      const porcentaje = calcularPorcentajeCompletitud(preguntasVisibles, respuestasSimples);

      return {
        ...prev,
        respuestas: nuevasRespuestas,
        preguntasVisibles,
        progreso: {
          ...prev.progreso,
          preguntas_respondidas: preguntasRespondidas,
          preguntas_visibles: preguntasVisibles.length,
          porcentaje
        }
      };
    });
  }, []);

  // Función para enviar todas las respuestas
  const submitRespuestas = useCallback(async (formularioId: number) => {
    try {
      setState(prev => ({ ...prev, enviandoRespuestas: true, error: undefined }));

      // Preparar respuestas para envío
      const respuestasParaEnvio: RespuestaFormularioCreate[] = Object.entries(state.respuestas).map(
        ([preguntaId, respuesta]) => ({
          pregunta_id: parseInt(preguntaId),
          valor_respuesta: respuesta.valor,
          valor_otro: respuesta.otro || undefined
        })
      );

      // Generar sessionId si no existe
      let sessionId = state.sessionId;
      if (!sessionId) {
        sessionId = generarSessionId();
        setState(prev => ({ ...prev, sessionId }));
      }

      const requestData: EnvioRespuestasRequest = {
        session_id: sessionId,
        formulario_id: formularioId,
        respuestas: respuestasParaEnvio
      };

      const response = await fetch(API.diagnosticoIndustria.responder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        enviandoRespuestas: false,
        estadoFormulario: 'completado'
      }));

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar respuestas';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        enviandoRespuestas: false 
      }));
      console.error('Error submitRespuestas:', err);
      throw err;
    }
  }, [state.respuestas, state.sessionId, generarSessionId]);

  // Función para obtener sugerencias personalizadas
  const fetchSugerencias = useCallback(async (sessionId: string) => {
    try {
      setState(prev => ({ ...prev, cargandoSugerencias: true, error: undefined }));

      const response = await fetch(API.diagnosticoIndustria.sugerencias(sessionId));
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const sugerencias: SugerenciasResponse = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        sugerencias,
        cargandoSugerencias: false 
      }));

      return sugerencias;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener sugerencias';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        cargandoSugerencias: false 
      }));
      console.error('Error fetchSugerencias:', err);
      throw err;
    }
  }, []);

  // Función para crear nueva sesión
  const crearNuevaSesion = useCallback(async () => {
    try {
      const response = await fetch(API.diagnosticoIndustria.nuevaSesion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        sessionId: result.session_id,
        estadoFormulario: 'en_progreso'
      }));

      return result.session_id;

    } catch (err) {
      console.error('Error crearNuevaSesion:', err);
      // Fallback a generación local
      const sessionId = generarSessionId();
      setState(prev => ({ 
        ...prev, 
        sessionId,
        estadoFormulario: 'en_progreso'
      }));
      return sessionId;
    }
  }, [generarSessionId]);

  // Función para validar respuestas actuales
  const validarRespuestas = useCallback(() => {
    const respuestasSimples = Object.fromEntries(
      Object.entries(state.respuestas).map(([id, resp]) => [parseInt(id), resp.valor])
    );
    const camposOtro = Object.fromEntries(
      Object.entries(state.respuestas)
        .filter(([, resp]) => resp.otro)
        .map(([id, resp]) => [parseInt(id), resp.otro!])
    );
    
    const errores = validarFormulario(state.preguntasVisibles, respuestasSimples, camposOtro);
    
    setState(prev => ({ ...prev, erroresValidacion: errores }));
    
    return errores.length === 0;
  }, [state.respuestas, state.preguntasVisibles]);

  // Función para resetear formulario
  const resetearFormulario = useCallback(() => {
    setState(prev => ({
      ...prev,
      respuestas: {},
      sessionId: '',
      preguntasVisibles: [],
      progreso: {
        paso_actual: 0,
        total_pasos: 0,
        porcentaje: 0,
        preguntas_respondidas: 0,
        preguntas_visibles: 0
      },
      estadoFormulario: 'no_iniciado',
      sugerencias: undefined,
      erroresValidacion: [],
      error: undefined
    }));
  }, []);

  // Función para obtener estado de sesión
  const obtenerEstadoSesion = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(API.diagnosticoIndustria.sesion(sessionId));
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const estado = await response.json();
      return estado;

    } catch (err) {
      console.error('Error obtenerEstadoSesion:', err);
      return null;
    }
  }, []);

  return {
    // Estado
    ...state,
    
    // Acciones principales
    fetchFormularios,
    fetchPreguntas,
    saveRespuesta,
    submitRespuestas,
    fetchSugerencias,
    crearNuevaSesion,
    obtenerEstadoSesion,
    
    // Utilidades
    validarRespuestas,
    resetearFormulario,
    generarSessionId
  };
}; 