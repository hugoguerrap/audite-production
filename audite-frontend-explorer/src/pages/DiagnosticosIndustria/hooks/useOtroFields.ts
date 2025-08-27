/**
 * Hook para gestión de campos "Otro" dinámicos
 * Controla visibilidad, valores y validación de inputs "Otro"
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UseOtroFieldsState, PreguntaFormulario, ErrorValidacion } from '@/types/industria';
import { validarCampoOtro } from '../utils/formValidation';

interface UseOtroFieldsProps {
  respuestas: Record<number, any>;
  preguntas: PreguntaFormulario[];
}

interface CampoOtroDetalle {
  visible: boolean;
  valor: string;
  requerido: boolean;
  validado: boolean;
  errores: ErrorValidacion[];
  placeholder?: string;
}

interface UseOtroFieldsReturn {
  campos_otro: Record<number, string>;
  campos_visibles: Record<number, boolean>;
  campos_detalle: Record<number, CampoOtroDetalle>;
  handleOtroChange: (preguntaId: number, valor: string) => void;
  getOtroValue: (preguntaId: number) => string;
  clearOtroValue: (preguntaId: number) => void;
  setOtroVisibility: (preguntaId: number, visible: boolean) => void;
  validateOtroField: (preguntaId: number) => boolean;
  validateAllOtroFields: () => boolean;
  clearAllOtroFields: () => void;
  getOtroErrors: (preguntaId: number) => ErrorValidacion[];
  getAllOtroErrors: () => ErrorValidacion[];
  getTotalOtroFieldsVisible: () => number;
  hasVisibleOtroFields: boolean;
  hasOtroErrors: boolean;
}

export const useOtroFields = ({ 
  respuestas, 
  preguntas 
}: UseOtroFieldsProps): UseOtroFieldsReturn => {
  
  const [state, setState] = useState<UseOtroFieldsState>({
    campos_otro: {},
    campos_visibles: {}
  });

  const [validaciones, setValidaciones] = useState<Record<number, ErrorValidacion[]>>({});

  // Memoizar preguntas que soportan "Otro"
  const preguntasConOtro = useMemo(() => {
    return preguntas.filter(p => p.tiene_opcion_otro);
  }, [preguntas]);

  // Memoizar detalles de campos "Otro" con validaciones
  const campos_detalle = useMemo((): Record<number, CampoOtroDetalle> => {
    const detalle: Record<number, CampoOtroDetalle> = {};
    
    preguntasConOtro.forEach(pregunta => {
      const visible = state.campos_visibles[pregunta.id] || false;
      const valor = state.campos_otro[pregunta.id] || '';
      const errores = validaciones[pregunta.id] || [];
      const requerido = pregunta.requerida && visible && respuestas[pregunta.id] === 'Otro';
      
      detalle[pregunta.id] = {
        visible,
        valor,
        requerido,
        validado: errores.length === 0,
        errores,
        placeholder: pregunta.placeholder_otro || 'Especificar...'
      };
    });
    
    return detalle;
  }, [preguntasConOtro, state, validaciones, respuestas]);

  // Función para manejar cambios en campos "Otro"
  const handleOtroChange = useCallback((preguntaId: number, valor: string) => {
    setState(prev => ({
      ...prev,
      campos_otro: {
        ...prev.campos_otro,
        [preguntaId]: valor
      }
    }));

    // Validar inmediatamente si está visible y es requerido
    const pregunta = preguntas.find(p => p.id === preguntaId);
    if (pregunta && state.campos_visibles[preguntaId]) {
      const esRequerido = pregunta.requerida && respuestas[preguntaId] === 'Otro';
      const errores = validarCampoOtro(preguntaId, valor, esRequerido);
      
      setValidaciones(prev => ({
        ...prev,
        [preguntaId]: errores
      }));
    }
  }, [preguntas, state.campos_visibles, respuestas]);

  // Función para obtener valor de campo "Otro"
  const getOtroValue = useCallback((preguntaId: number): string => {
    return state.campos_otro[preguntaId] || '';
  }, [state.campos_otro]);

  // Función para limpiar valor de campo "Otro"
  const clearOtroValue = useCallback((preguntaId: number) => {
    setState(prev => ({
      ...prev,
      campos_otro: {
        ...prev.campos_otro,
        [preguntaId]: ''
      }
    }));

    // Limpiar validaciones también
    setValidaciones(prev => ({
      ...prev,
      [preguntaId]: []
    }));
  }, []);

  // Función para mostrar/ocultar campo "Otro"
  const setOtroVisibility = useCallback((preguntaId: number, visible: boolean) => {
    setState(prev => ({
      ...prev,
      campos_visibles: {
        ...prev.campos_visibles,
        [preguntaId]: visible
      }
    }));

    // Si se oculta, limpiar valor y validaciones
    if (!visible) {
      setState(prev => ({
        ...prev,
        campos_otro: {
          ...prev.campos_otro,
          [preguntaId]: ''
        }
      }));

      setValidaciones(prev => ({
        ...prev,
        [preguntaId]: []
      }));
    }
  }, []);

  // Función para validar un campo "Otro" específico
  const validateOtroField = useCallback((preguntaId: number): boolean => {
    const pregunta = preguntas.find(p => p.id === preguntaId);
    if (!pregunta || !state.campos_visibles[preguntaId]) {
      return true; // Si no es visible, es válido
    }

    const valor = state.campos_otro[preguntaId] || '';
    const esRequerido = pregunta.requerida && respuestas[preguntaId] === 'Otro';
    const errores = validarCampoOtro(preguntaId, valor, esRequerido);

    setValidaciones(prev => ({
      ...prev,
      [preguntaId]: errores
    }));

    return errores.length === 0;
  }, [preguntas, state, respuestas]);

  // Función para validar todos los campos "Otro" visibles
  const validateAllOtroFields = useCallback((): boolean => {
    let todosValidos = true;
    const nuevasValidaciones: Record<number, ErrorValidacion[]> = {};

    Object.keys(state.campos_visibles).forEach(preguntaIdStr => {
      const preguntaId = parseInt(preguntaIdStr);
      if (state.campos_visibles[preguntaId]) {
        const pregunta = preguntas.find(p => p.id === preguntaId);
        if (pregunta) {
          const valor = state.campos_otro[preguntaId] || '';
          const esRequerido = pregunta.requerida && respuestas[preguntaId] === 'Otro';
          const errores = validarCampoOtro(preguntaId, valor, esRequerido);

          nuevasValidaciones[preguntaId] = errores;
          if (errores.length > 0) {
            todosValidos = false;
          }
        }
      }
    });

    setValidaciones(prev => ({ ...prev, ...nuevasValidaciones }));
    return todosValidos;
  }, [state, preguntas, respuestas]);

  // Función para limpiar todos los campos "Otro"
  const clearAllOtroFields = useCallback(() => {
    setState({
      campos_otro: {},
      campos_visibles: {}
    });
    setValidaciones({});
  }, []);

  // Función para obtener errores de un campo específico
  const getOtroErrors = useCallback((preguntaId: number): ErrorValidacion[] => {
    return validaciones[preguntaId] || [];
  }, [validaciones]);

  // Función para obtener todos los errores de campos "Otro"
  const getAllOtroErrors = useCallback((): ErrorValidacion[] => {
    const todosLosErrores: ErrorValidacion[] = [];
    Object.values(validaciones).forEach(errores => {
      todosLosErrores.push(...errores);
    });
    return todosLosErrores;
  }, [validaciones]);

  // Función para contar campos "Otro" visibles
  const getTotalOtroFieldsVisible = useCallback((): number => {
    return Object.values(state.campos_visibles).filter(Boolean).length;
  }, [state.campos_visibles]);

  // Computed values
  const hasVisibleOtroFields = useMemo(() => {
    return Object.values(state.campos_visibles).some(Boolean);
  }, [state.campos_visibles]);

  const hasOtroErrors = useMemo(() => {
    return Object.values(validaciones).some(errores => errores.length > 0);
  }, [validaciones]);

  // Efecto para evaluar visibilidad automática basada en respuestas
  useEffect(() => {
    const nuevosVisibles: Record<number, boolean> = { ...state.campos_visibles };
    let cambiosRealizados = false;

    preguntasConOtro.forEach(pregunta => {
      const respuesta = respuestas[pregunta.id];
      const deberiaEstarVisible = respuesta === 'Otro' || 
        (Array.isArray(respuesta) && respuesta.includes('Otro'));
      
      if (nuevosVisibles[pregunta.id] !== deberiaEstarVisible) {
        nuevosVisibles[pregunta.id] = deberiaEstarVisible;
        cambiosRealizados = true;

        // Si se oculta, limpiar valor
        if (!deberiaEstarVisible) {
          setState(prev => ({
            ...prev,
            campos_otro: {
              ...prev.campos_otro,
              [pregunta.id]: ''
            }
          }));
          setValidaciones(prev => ({
            ...prev,
            [pregunta.id]: []
          }));
        }
      }
    });

    if (cambiosRealizados) {
      setState(prev => ({
        ...prev,
        campos_visibles: nuevosVisibles
      }));
    }
  }, [respuestas, preguntasConOtro, state.campos_visibles]);

  // Efecto para logging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useOtroFields State:', {
        totalCamposOtro: Object.keys(state.campos_otro).length,
        camposVisibles: getTotalOtroFieldsVisible(),
        tieneErrores: hasOtroErrors,
        preguntasConOtroDisponibles: preguntasConOtro.length
      });
    }
  }, [state, getTotalOtroFieldsVisible, hasOtroErrors, preguntasConOtro.length]);

  return {
    campos_otro: state.campos_otro,
    campos_visibles: state.campos_visibles,
    campos_detalle,
    handleOtroChange,
    getOtroValue,
    clearOtroValue,
    setOtroVisibility,
    validateOtroField,
    validateAllOtroFields,
    clearAllOtroFields,
    getOtroErrors,
    getAllOtroErrors,
    getTotalOtroFieldsVisible,
    hasVisibleOtroFields,
    hasOtroErrors
  };
}; 