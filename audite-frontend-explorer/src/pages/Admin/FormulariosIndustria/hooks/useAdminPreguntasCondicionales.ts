/**
 * Hook admin para gestión de preguntas condicionales
 * CRUD completo con validación de dependencias y preview
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PreguntaFormulario, 
  PreguntaFormularioCreate, 
  PreguntaFormularioUpdate,
  FormularioIndustria,
  ValidacionDependencias,
  AnalisisCondicionales
} from '@/types/industria';
import { API } from '@/config/api';
import { 
  validarEstructuraDependencias,
  detectarCiclosDependencias,
  obtenerPreguntasDependientes
} from '../../../DiagnosticosIndustria/utils/conditionalLogic';

interface UseAdminPreguntasCondicionalesReturn {
  preguntas: PreguntaFormulario[];
  preguntasOrdenadas: PreguntaFormulario[];
  formularios: FormularioIndustria[];
  formulario: FormularioIndustria | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
  formularioActual: number | null;
  fetchPreguntas: (formularioId: number) => Promise<void>;
  fetchFormulario: (formularioId: number) => Promise<void>;
  crearPregunta: (data: PreguntaFormularioCreate) => Promise<PreguntaFormulario>;
  actualizarPregunta: (id: number, data: PreguntaFormularioUpdate) => Promise<PreguntaFormulario>;
  eliminarPregunta: (id: number, forzar?: boolean) => Promise<void>;
  reordenarPreguntas: (formularioId: number, ordenIds: number[]) => Promise<void>;
  duplicarPregunta: (id: number) => Promise<PreguntaFormulario>;
  toggleEstadoPregunta: (id: number) => Promise<void>;
  // Alias en inglés
  createPregunta: (data: PreguntaFormularioCreate) => Promise<PreguntaFormulario>;
  updatePregunta: (id: number, data: PreguntaFormularioUpdate) => Promise<PreguntaFormulario>;
  deletePregunta: (id: number, forzar?: boolean) => Promise<void>;
  duplicatePregunta: (id: number) => Promise<PreguntaFormulario>;
  reorderPreguntas: (formularioId: number, ordenIds: number[]) => Promise<void>;
  exportPreguntas: () => Promise<void>;
  importPreguntas: () => Promise<void>;
  validateCondiciones: (formularioId: number) => ValidacionDependencias;
  // Funciones adicionales
  validarDependenciasPregunta: (pregunta: PreguntaFormulario) => ValidacionDependencias;
  previewFormulario: (formularioId: number) => Promise<any>;
  getAnalisisCondicionales: (formularioId: number) => Promise<AnalisisCondicionales>;
  getPreguntaById: (id: number) => PreguntaFormulario | undefined;
  getPreguntasPadre: (formularioId: number) => PreguntaFormulario[];
  getPreguntasDependientes: (preguntaId: number) => PreguntaFormulario[];
  validarEstructuraCompleta: (formularioId: number) => ValidacionDependencias;
  refreshAfterOperation: () => Promise<void>;
}

export const useAdminPreguntasCondicionales = (): UseAdminPreguntasCondicionalesReturn => {
  const [preguntas, setPreguntas] = useState<PreguntaFormulario[]>([]);
  const [formularios, setFormularios] = useState<FormularioIndustria[]>([]);
  const [formulario, setFormulario] = useState<FormularioIndustria | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formularioActual, setFormularioActual] = useState<number | null>(null);

  // Función para obtener headers de autenticación
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }, []);

  // Memoizar preguntas ordenadas
  const preguntasOrdenadas = useMemo(() => {
    return [...preguntas].sort((a, b) => a.orden - b.orden);
  }, [preguntas]);

  // Función para cargar preguntas de un formulario
  const fetchPreguntas = useCallback(async (formularioId: number) => {
    try {
      setLoading(true);
      setError(null);
      setFormularioActual(formularioId);

      const response = await fetch(
        API.adminFormularios.preguntas.byFormulario(formularioId), 
        {
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: PreguntaFormulario[] = await response.json();
      setPreguntas(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar preguntas';
      setError(errorMessage);
      console.error('Error fetchPreguntas:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Función para cargar formularios (para selección de padres)
  const fetchFormularios = useCallback(async () => {
    try {
      const response = await fetch(API.adminFormularios.formularios.list, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data: FormularioIndustria[] = await response.json();
        setFormularios(data);
      }
    } catch (err) {
      console.error('Error fetchFormularios:', err);
    }
  }, [getAuthHeaders]);

  // Función para cargar un formulario específico
  const fetchFormulario = useCallback(async (formularioId: number) => {
    try {
      const response = await fetch(`${API.adminFormularios.formularios.list}/${formularioId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data: FormularioIndustria = await response.json();
        setFormulario(data);
        setFormularioActual(formularioId);
      }
    } catch (err) {
      console.error('Error fetchFormulario:', err);
      setFormulario(null);
    }
  }, [getAuthHeaders]);

  // Función para crear pregunta
  const crearPregunta = useCallback(async (data: PreguntaFormularioCreate): Promise<PreguntaFormulario> => {
    try {
      setCreating(true);
      setError(null);

      // Validar lógica condicional antes de crear
      if (data.pregunta_padre_id) {
        const preguntasPadre = preguntas.filter(p => p.id !== data.pregunta_padre_id);
        const preguntaTemp = { ...data, id: 0 } as PreguntaFormulario;
        const validacion = validarEstructuraDependencias([...preguntasPadre, preguntaTemp]);
        
        if (!validacion.valida) {
          throw new Error(`Dependencias inválidas: ${validacion.errores.join(', ')}`);
        }
      }

      const response = await fetch(API.adminFormularios.preguntas.create, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const nuevaPregunta: PreguntaFormulario = await response.json();
      
      // Actualizar lista local
      setPreguntas(prev => [...prev, nuevaPregunta]);
      
      return nuevaPregunta;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear pregunta';
      setError(errorMessage);
      console.error('Error crearPregunta:', err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [getAuthHeaders, preguntas]);

  // Función para actualizar pregunta
  const actualizarPregunta = useCallback(async (
    id: number, 
    data: PreguntaFormularioUpdate
  ): Promise<PreguntaFormulario> => {
    try {
      setUpdating(true);
      setError(null);

      // Validar lógica condicional antes de actualizar
      if (data.pregunta_padre_id !== undefined) {
        const preguntasOtras = preguntas.filter(p => p.id !== id);
        const preguntaExistente = preguntas.find(p => p.id === id);
        if (preguntaExistente) {
          const preguntaActualizada = { ...preguntaExistente, ...data } as PreguntaFormulario;
          const validacion = validarEstructuraDependencias([...preguntasOtras, preguntaActualizada]);
          
          if (!validacion.valida) {
            throw new Error(`Dependencias inválidas: ${validacion.errores.join(', ')}`);
          }
        }
      }

      const response = await fetch(API.adminFormularios.preguntas.update(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const preguntaActualizada: PreguntaFormulario = await response.json();
      
      // Actualizar lista local
      setPreguntas(prev => prev.map(p => p.id === id ? preguntaActualizada : p));
      
      return preguntaActualizada;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar pregunta';
      setError(errorMessage);
      console.error('Error actualizarPregunta:', err);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [getAuthHeaders, preguntas]);

  // Función para eliminar pregunta
  const eliminarPregunta = useCallback(async (id: number, forzar = false) => {
    try {
      setDeleting(true);
      setError(null);

      // Verificar dependencias antes de eliminar
      const dependientes = obtenerPreguntasDependientes(id, preguntas);
      if (dependientes.length > 0 && !forzar) {
        throw new Error(`La pregunta tiene ${dependientes.length} preguntas dependientes. Use eliminación forzada si es necesario.`);
      }

      const url = forzar 
        ? `${API.adminFormularios.preguntas.delete(id)}?forzar_eliminacion=true`
        : API.adminFormularios.preguntas.delete(id);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'La pregunta tiene dependencias');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualizar lista local
      setPreguntas(prev => prev.filter(p => p.id !== id));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar pregunta';
      setError(errorMessage);
      console.error('Error eliminarPregunta:', err);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [getAuthHeaders, preguntas]);

  // Función para reordenar preguntas
  const reordenarPreguntas = useCallback(async (formularioId: number, ordenIds: number[]) => {
    try {
      setReordering(true);
      setError(null);

      // Validar que el nuevo orden no rompa dependencias
      const preguntasReordenadas = ordenIds.map((id, index) => {
        const pregunta = preguntas.find(p => p.id === id);
        return pregunta ? { ...pregunta, orden: index + 1 } : null;
      }).filter(Boolean) as PreguntaFormulario[];

      const validacion = validarEstructuraDependencias(preguntasReordenadas);
      if (!validacion.valida) {
        throw new Error(`El nuevo orden rompe dependencias: ${validacion.errores.join(', ')}`);
      }

      // Enviar reordenamiento al servidor
      const promises = ordenIds.map((preguntaId, index) => {
        return fetch(API.adminFormularios.preguntas.reordenar(preguntaId), {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ orden: index + 1 }),
        });
      });

      await Promise.all(promises);
      
      // Refrescar preguntas
      await fetchPreguntas(formularioId);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reordenar preguntas';
      setError(errorMessage);
      console.error('Error reordenarPreguntas:', err);
      throw err;
    } finally {
      setReordering(false);
    }
  }, [getAuthHeaders, preguntas, fetchPreguntas]);

  // Función para duplicar pregunta
  const duplicarPregunta = useCallback(async (id: number): Promise<PreguntaFormulario> => {
    const preguntaOriginal = preguntas.find(p => p.id === id);
    if (!preguntaOriginal) {
      throw new Error('Pregunta no encontrada');
    }

    const dataDuplicada: PreguntaFormularioCreate = {
      formulario_id: preguntaOriginal.formulario_id,
      texto: `${preguntaOriginal.texto} (Copia)`,
      subtitulo: preguntaOriginal.subtitulo,
      tipo: preguntaOriginal.tipo,
      opciones: preguntaOriginal.opciones ? [...preguntaOriginal.opciones] : undefined,
      tiene_opcion_otro: preguntaOriginal.tiene_opcion_otro,
      placeholder_otro: preguntaOriginal.placeholder_otro,
      orden: Math.max(...preguntas.map(p => p.orden)) + 1,
      requerida: preguntaOriginal.requerida,
      activa: false, // Crear como inactiva
      // NO duplicar dependencias condicionales para evitar loops
      pregunta_padre_id: undefined,
      condicion_valor: undefined,
      condicion_operador: undefined
    };

    return await crearPregunta(dataDuplicada);
  }, [preguntas, crearPregunta]);

  // Función para activar/desactivar pregunta
  const toggleEstadoPregunta = useCallback(async (id: number) => {
    const pregunta = preguntas.find(p => p.id === id);
    if (!pregunta) return;

    await actualizarPregunta(id, { activa: !pregunta.activa });
  }, [preguntas, actualizarPregunta]);

  // Función para validar dependencias de una pregunta
  const validarDependenciasPregunta = useCallback((pregunta: PreguntaFormulario): ValidacionDependencias => {
    return validarEstructuraDependencias([pregunta, ...preguntas.filter(p => p.id !== pregunta.id)]);
  }, [preguntas]);

  // Función para preview del formulario
  const previewFormulario = useCallback(async (formularioId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API.adminFormularios.analisis.condicionales(formularioId)}?incluir_preview=true`,
        { headers: getAuthHeaders() }
      );

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Error al generar preview');
      }
    } catch (err) {
      console.error('Error previewFormulario:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Función para análisis de condicionales
  const getAnalisisCondicionales = useCallback(async (formularioId: number): Promise<AnalisisCondicionales> => {
    try {
      const response = await fetch(
        API.adminFormularios.analisis.condicionales(formularioId),
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error getAnalisisCondicionales:', err);
      throw err;
    }
  }, [getAuthHeaders]);

  // Función para obtener pregunta por ID
  const getPreguntaById = useCallback((id: number): PreguntaFormulario | undefined => {
    return preguntas.find(pregunta => pregunta.id === id);
  }, [preguntas]);

  // Función para obtener preguntas padre (sin dependencias)
  const getPreguntasPadre = useCallback((formularioId: number): PreguntaFormulario[] => {
    return preguntas.filter(p => p.formulario_id === formularioId && !p.pregunta_padre_id);
  }, [preguntas]);

  // Función para obtener preguntas dependientes
  const getPreguntasDependientes = useCallback((preguntaId: number): PreguntaFormulario[] => {
    return obtenerPreguntasDependientes(preguntaId, preguntas);
  }, [preguntas]);

  // Función para validar estructura completa
  const validarEstructuraCompleta = useCallback((formularioId: number): ValidacionDependencias => {
    const preguntasFormulario = preguntas.filter(p => p.formulario_id === formularioId);
    return validarEstructuraDependencias(preguntasFormulario);
  }, [preguntas]);

  // Función para refrescar después de operaciones
  const refreshAfterOperation = useCallback(async () => {
    if (formularioActual) {
      await fetchPreguntas(formularioActual);
    }
  }, [formularioActual, fetchPreguntas]);

  // Cargar formularios al inicializar
  useEffect(() => {
    fetchFormularios();
  }, [fetchFormularios]);

  // Log para debugging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useAdminPreguntasCondicionales State:', {
        totalPreguntas: preguntas.length,
        formularioActual,
        loading,
        creating,
        updating,
        deleting,
        reordering,
        hasError: !!error,
        hayCiclos: detectarCiclosDependencias(preguntas)
      });
    }
  }, [preguntas.length, formularioActual, loading, creating, updating, deleting, reordering, error, preguntas]);

  return {
    preguntas,
    preguntasOrdenadas,
    formularios,
    formulario,
    loading,
    error,
    creating,
    updating,
    deleting,
    reordering,
    formularioActual,
    fetchPreguntas,
    fetchFormulario,
    crearPregunta,
    actualizarPregunta,
    eliminarPregunta,
    reordenarPreguntas,
    duplicarPregunta,
    toggleEstadoPregunta,
    // Alias en inglés para compatibilidad
    createPregunta: crearPregunta,
    updatePregunta: actualizarPregunta,
    deletePregunta: eliminarPregunta,
    duplicatePregunta: duplicarPregunta,
    reorderPreguntas: reordenarPreguntas,
    exportPreguntas: async () => { console.log('exportPreguntas: Pendiente de implementación'); },
    importPreguntas: async () => { console.log('importPreguntas: Pendiente de implementación'); },
    validateCondiciones: validarEstructuraCompleta,
    // Funciones adicionales
    validarDependenciasPregunta,
    previewFormulario,
    getAnalisisCondicionales,
    getPreguntaById,
    getPreguntasPadre,
    getPreguntasDependientes,
    validarEstructuraCompleta,
    refreshAfterOperation
  };
}; 