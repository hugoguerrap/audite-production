/**
 * Hook para gestión de preguntas condicionales
 * Evalúa condiciones y determina qué preguntas mostrar
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PreguntaCondicional, OperadorCondicional } from '@/types/industria';
import { 
  evaluarCondicionPregunta, 
  filtrarPreguntasVisibles, 
  detectarCiclosDependencias,
  obtenerPreguntasDependientes,
  validarEstructuraDependencias,
  calcularNivelDependencia
} from '../utils/conditionalLogic';

interface EvaluacionCondicion {
  pregunta_id: number;
  debe_mostrar: boolean;
  razon?: string;
  dependencias_cumplidas: boolean;
  pregunta_padre_respondida: boolean;
}

interface UseConditionalQuestionsProps {
  preguntas: PreguntaCondicional[];
  respuestas: Record<number, any>;
}

interface UseConditionalQuestionsReturn {
  preguntasVisibles: PreguntaCondicional[];
  evaluaciones: EvaluacionCondicion[];
  dependenciasResueltas: boolean;
  estructuraValida: boolean;
  evaluarCondiciones: () => void;
  evaluateCondition: (pregunta: PreguntaCondicional, respuestas: Record<number, any>) => boolean;
  getVisibleQuestions: (preguntas: PreguntaCondicional[], respuestas: Record<number, any>) => PreguntaCondicional[];
  validateDependencies: (pregunta: PreguntaCondicional) => { valida: boolean; errores: string[]; advertencias: string[] };
  obtenerPreguntasDependientes: (preguntaId: number) => PreguntaCondicional[];
  calcularNivelPregunta: (pregunta: PreguntaCondicional) => number;
  getMapaDependencias: () => Record<number, number[]>;
  hayErroresDependencias: boolean;
}

export const useConditionalQuestions = ({ 
  preguntas, 
  respuestas 
}: UseConditionalQuestionsProps): UseConditionalQuestionsReturn => {
  
  const [preguntasVisibles, setPreguntasVisibles] = useState<PreguntaCondicional[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionCondicion[]>([]);
  const [dependenciasResueltas, setDependenciasResueltas] = useState(false);
  const [estructuraValida, setEstructuraValida] = useState(true);

  // Memoizar validación de estructura para evitar recálculos innecesarios
  const validacionEstructura = useMemo(() => {
    if (preguntas.length === 0) return { valida: true, errores: [], advertencias: [] };
    
    return validarEstructuraDependencias(preguntas);
  }, [preguntas]);

  // Función para evaluar una condición específica
  const evaluateCondition = useCallback((
    pregunta: PreguntaCondicional, 
    respuestasActuales: Record<number, any>
  ): boolean => {
    return evaluarCondicionPregunta(pregunta, respuestasActuales);
  }, []);

  // Función para obtener preguntas visibles
  const getVisibleQuestions = useCallback((
    preguntasInput: PreguntaCondicional[], 
    respuestasActuales: Record<number, any>
  ): PreguntaCondicional[] => {
    return filtrarPreguntasVisibles(preguntasInput, respuestasActuales);
  }, []);

  // Función para validar dependencias de una pregunta específica
  const validateDependencies = useCallback((pregunta: PreguntaCondicional) => {
    const validacion = validarEstructuraDependencias([pregunta, ...preguntas]);
    return {
      valida: validacion.valida,
      errores: validacion.errores,
      advertencias: validacion.advertencias
    };
  }, [preguntas]);

  // Función para obtener preguntas que dependen de una pregunta específica
  const obtenerPreguntasDependientesHook = useCallback((preguntaId: number): PreguntaCondicional[] => {
    return obtenerPreguntasDependientes(preguntaId, preguntas);
  }, [preguntas]);

  // Función para calcular nivel de dependencia de una pregunta
  const calcularNivelPregunta = useCallback((pregunta: PreguntaCondicional): number => {
    return calcularNivelDependencia(pregunta, preguntas);
  }, [preguntas]);

  // Función para obtener mapa completo de dependencias
  const getMapaDependencias = useCallback((): Record<number, number[]> => {
    const mapa: Record<number, number[]> = {};
    
    preguntas.forEach(pregunta => {
      if (pregunta.pregunta_padre_id) {
        if (!mapa[pregunta.pregunta_padre_id]) {
          mapa[pregunta.pregunta_padre_id] = [];
        }
        mapa[pregunta.pregunta_padre_id].push(pregunta.id);
      }
    });
    
    return mapa;
  }, [preguntas]);

  // Función principal para evaluar todas las condiciones
  const evaluarCondiciones = useCallback(() => {
    if (preguntas.length === 0) {
      setPreguntasVisibles([]);
      setEvaluaciones([]);
      setDependenciasResueltas(true);
      return;
    }

    // Filtrar preguntas visibles
    const visibles = getVisibleQuestions(preguntas, respuestas);
    setPreguntasVisibles(visibles);

    // Generar evaluaciones detalladas
    const nuevasEvaluaciones: EvaluacionCondicion[] = preguntas.map(pregunta => {
      const debe_mostrar = evaluateCondition(pregunta, respuestas);
      const pregunta_padre_respondida = pregunta.pregunta_padre_id 
        ? (pregunta.pregunta_padre_id in respuestas)
        : true;
      
      let razon = '';
      if (!pregunta.pregunta_padre_id) {
        razon = 'Pregunta base sin dependencias';
      } else if (!pregunta_padre_respondida) {
        razon = 'Pregunta padre no respondida';
      } else if (!debe_mostrar) {
        razon = 'Condición no cumplida';
      } else {
        razon = 'Condición cumplida';
      }

      return {
        pregunta_id: pregunta.id,
        debe_mostrar,
        razon,
        dependencias_cumplidas: debe_mostrar,
        pregunta_padre_respondida
      };
    });

    setEvaluaciones(nuevasEvaluaciones);

    // Verificar si todas las dependencias están resueltas
    const todasResueltas = nuevasEvaluaciones.every(ev => 
      !ev.debe_mostrar || ev.dependencias_cumplidas
    );
    setDependenciasResueltas(todasResueltas);

  }, [preguntas, respuestas, evaluateCondition, getVisibleQuestions]);

  // Detectar si hay errores en la estructura de dependencias
  const hayErroresDependencias = useMemo(() => {
    // Verificar ciclos
    const hayCiclos = detectarCiclosDependencias(preguntas);
    
    // Verificar estructura general
    const estructuraInvalida = !validacionEstructura.valida;
    
    return hayCiclos || estructuraInvalida;
  }, [preguntas, validacionEstructura]);

  // Actualizar estado de estructura válida
  useEffect(() => {
    setEstructuraValida(validacionEstructura.valida && !detectarCiclosDependencias(preguntas));
  }, [validacionEstructura, preguntas]);

  // Re-evaluar condiciones cuando cambien preguntas o respuestas
  useEffect(() => {
    evaluarCondiciones();
  }, [evaluarCondiciones]);

  // Log de debugging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useConditionalQuestions State:', {
        totalPreguntas: preguntas.length,
        preguntasVisibles: preguntasVisibles.length,
        respuestasCount: Object.keys(respuestas).length,
        dependenciasResueltas,
        estructuraValida,
        hayErrores: hayErroresDependencias
      });
    }
  }, [preguntas.length, preguntasVisibles.length, Object.keys(respuestas).length, dependenciasResueltas, estructuraValida, hayErroresDependencias]);

  return {
    preguntasVisibles,
    evaluaciones,
    dependenciasResueltas,
    estructuraValida,
    evaluarCondiciones,
    evaluateCondition,
    getVisibleQuestions,
    validateDependencies,
    obtenerPreguntasDependientes: obtenerPreguntasDependientesHook,
    calcularNivelPregunta,
    getMapaDependencias,
    hayErroresDependencias
  };
}; 