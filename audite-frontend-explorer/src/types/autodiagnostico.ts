export interface AutodiagnosticoOpcion {
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

export interface AutodiagnosticoPregunta {
  id: number;
  numero_orden: number;
  pregunta: string;
  tipo_respuesta: 'radio' | 'checkbox' | 'text' | 'number' | 'select' | 'ordering';
  es_obligatoria: boolean;
  es_activa: boolean;
  ayuda_texto?: string;
  created_at: string;
  updated_at: string;
  opciones: AutodiagnosticoOpcion[];
}

export interface AutodiagnosticoRespuesta {
  session_id: string;
  pregunta_id: number;
  respuesta_texto?: string;
  respuesta_numero?: number;
  opciones_seleccionadas?: string[];
  opcion_seleccionada?: string;
  archivo_adjunto?: string;
}

export interface AutodiagnosticoSesion {
  session_id: string;
  respuestas: (AutodiagnosticoRespuesta & {
    id: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    updated_at: string;
    pregunta: AutodiagnosticoPregunta;
  })[];
  created_at: string;
  total_preguntas: number;
  preguntas_respondidas: number;
  completado: boolean;
}

// Tipos para administración de respuestas
export interface AutodiagnosticoRespuestaDetallada {
  id: string;
  session_id: string;
  pregunta_id: number;
  respuesta_texto?: string;
  respuesta_numero?: number;
  opciones_seleccionadas?: string[];
  opcion_seleccionada?: string;
  archivo_adjunto?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  pregunta: AutodiagnosticoPregunta;
}

export interface AutodiagnosticoRespuestasAdmin {
  respuestas: AutodiagnosticoRespuestaDetallada[];
  total: number;
  limit: number;
  offset: number;
}

export interface AutodiagnosticoSesionResumen {
  session_id: string;
  total_respuestas: number;
  fecha_inicio: string;
  fecha_ultima_respuesta: string;
  completado: boolean;
  ip_address?: string;
  user_agent?: string;
}

export interface AutodiagnosticoFormData {
  [key: string]: string | number | string[] | OrderingResponse | undefined;
}

// Tipos específicos para ordenamiento de procesos
export interface ProcessOrderItem {
  id: string;
  name: string;
  percentage: number;
  order: number;
}

export interface OrderingResponse {
  ordered_processes: ProcessOrderItem[];
  total_percentage: number;
}

// Tipos para sugerencias
export interface AutodiagnosticoSugerencia {
  pregunta_id: number;
  pregunta: string;
  opcion_seleccionada: string;
  sugerencia: string;
}

export interface AutodiagnosticoResultadosConSugerencias {
  session_id: string;
  respuestas: AutodiagnosticoRespuestaDetallada[];
  sugerencias: AutodiagnosticoSugerencia[];
  total_preguntas: number;
  preguntas_respondidas: number;
  completado: boolean;
  created_at: string;
}

// ============================================================================
// EXTENSIONES PARA CAMPOS "OTRO" Y PREGUNTAS CONDICIONALES
// ============================================================================

/**
 * Extensiones compatibles con el sistema existente de autodiagnóstico
 * Mantiene retrocompatibilidad mientras agrega nuevas funcionalidades
 */

// Extensión de AutodiagnosticoOpcion para campo "Otro"
export interface AutodiagnosticoOpcionExtendida extends AutodiagnosticoOpcion {
  // Nuevo campo para indicar si es opción "Otro"
  es_opcion_otro?: boolean;
  // Placeholder para el input de "Otro"
  placeholder_otro?: string;
}

// Extensión de AutodiagnosticoPregunta para lógica condicional
export interface AutodiagnosticoPreguntaExtendida extends AutodiagnosticoPregunta {
  // Campos para lógica condicional
  pregunta_padre_id?: number;
  condicion_valor?: any; // Valor que debe tener la pregunta padre
  condicion_operador?: '=' | '!=' | 'includes' | 'not_includes';
  
  // Indicadores de estado condicional
  es_condicional?: boolean;
  debe_mostrar?: boolean; // Calculado dinámicamente
  nivel_dependencia?: number;
  
  // Relaciones
  pregunta_padre?: AutodiagnosticoPreguntaExtendida;
  preguntas_hijas?: AutodiagnosticoPreguntaExtendida[];
  
  // Opciones extendidas con soporte "Otro"
  opciones: AutodiagnosticoOpcionExtendida[];
}

// Extensión de AutodiagnosticoRespuesta para campo "Otro"
export interface AutodiagnosticoRespuestaExtendida extends AutodiagnosticoRespuesta {
  // Valor del campo "Otro" si se selecciona
  valor_otro?: string;
  
  // Metadatos adicionales
  metadata?: {
    tiempo_respuesta?: number; // Tiempo en segundos
    modificada?: boolean; // Si la respuesta fue modificada
    validada?: boolean; // Si pasó validaciones condicionales
  };
}

// Extensión de AutodiagnosticoSesion para funcionalidades extendidas
export interface AutodiagnosticoSesionExtendida extends AutodiagnosticoSesion {
  // Respuestas extendidas
  respuestas: (AutodiagnosticoRespuestaExtendida & {
    id: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    updated_at: string;
    pregunta: AutodiagnosticoPreguntaExtendida;
  })[];
  
  // Información adicional
  preguntas_visibles?: number; // Según lógica condicional
  tiempo_total?: number; // En minutos
  validacion_condicional?: {
    valida: boolean;
    errores: string[];
    advertencias: string[];
  };
}

// Tipo para respuestas con soporte completo para "Otro"
export interface RespuestaConOtroAutodiagnostico {
  pregunta_id: number;
  valor_principal: any; // Valor principal de la respuesta
  valor_otro?: string; // Valor del campo "Otro"
  es_respuesta_otro: boolean; // Si se usó el campo "Otro"
}

// Estado para gestión de campos "Otro" en formularios
export interface EstadoCamposOtro {
  [pregunta_id: number]: {
    visible: boolean; // Si el campo "Otro" está visible
    valor: string; // Valor actual del campo "Otro"
    requerido: boolean; // Si el campo "Otro" es requerido
    validado: boolean; // Si el campo "Otro" pasó validación
  };
}

// Tipo para evaluación de condiciones en tiempo real
export interface EvaluacionCondicion {
  pregunta_id: number;
  debe_mostrar: boolean;
  razon?: string; // Por qué se muestra/oculta
  dependencias_cumplidas: boolean;
  pregunta_padre_respondida: boolean;
}

// Estado para navegación condicional
export interface EstadoNavegacionCondicional {
  paso_actual: number;
  pasos_disponibles: number[];
  pasos_bloqueados: number[];
  puede_avanzar: boolean;
  puede_retroceder: boolean;
  evaluaciones: EvaluacionCondicion[];
}

// Tipo híbrido para compatibilidad completa
export interface AutodiagnosticoCompleto {
  // Configuración base (compatible con sistema actual)
  preguntas_base: AutodiagnosticoPregunta[];
  
  // Preguntas extendidas (nuevas funcionalidades)
  preguntas_extendidas: AutodiagnosticoPreguntaExtendida[];
  
  // Indica qué sistema usar
  usa_sistema_extendido: boolean;
  
  // Configuración de funcionalidades
  configuracion: {
    habilitar_campos_otro: boolean;
    habilitar_logica_condicional: boolean;
    validacion_tiempo_real: boolean;
    guardar_automatico: boolean;
  };
}

// ============================================================================
// TIPOS PARA MIGRACIÓN Y COMPATIBILIDAD
// ============================================================================

// Utilidad para convertir entre formatos
export interface ConversionDatos {
  desde_formato_antiguo: (pregunta: AutodiagnosticoPregunta) => AutodiagnosticoPreguntaExtendida;
  hacia_formato_antiguo: (pregunta: AutodiagnosticoPreguntaExtendida) => AutodiagnosticoPregunta;
  es_compatible: (data: any) => boolean;
}

// Validación de compatibilidad
export interface ValidacionCompatibilidad {
  es_formato_actual: boolean;
  requiere_migracion: boolean;
  funcionalidades_perdidas: string[];
  recomendaciones: string[];
}

// ============================================================================
// TIPOS PARA HOOKS EXTENDIDOS
// ============================================================================

export interface UseAutodiagnosticoExtendidoState {
  // Estado base (compatible)
  preguntas: AutodiagnosticoPregunta[] | AutodiagnosticoPreguntaExtendida[];
  respuestas: AutodiagnosticoRespuesta[] | AutodiagnosticoRespuestaExtendida[];
  
  // Estados extendidos
  campos_otro: EstadoCamposOtro;
  navegacion_condicional: EstadoNavegacionCondicional;
  
  // Funciones de utilidad
  evaluarCondiciones: () => void;
  manejarCampoOtro: (preguntaId: number, valor: string) => void;
  validarRespuestasCondicionales: () => boolean;
  
  // Configuración
  modo_extendido: boolean;
  compatibilidad_habilitada: boolean;
}

// ============================================================================
// EXPORTS DE COMPATIBILIDAD
// ============================================================================

/**
 * Aliases para mantener compatibilidad con código existente
 * mientras se migra gradualmente al sistema extendido
 */
export type PreguntaAutodiagnostico = AutodiagnosticoPregunta;
export type PreguntaAutodiagnosticoExtendida = AutodiagnosticoPreguntaExtendida;
export type RespuestaAutodiagnostico = AutodiagnosticoRespuesta;
export type RespuestaAutodiagnosticoExtendida = AutodiagnosticoRespuestaExtendida;
export type SesionAutodiagnostico = AutodiagnosticoSesion;
export type SesionAutodiagnosticoExtendida = AutodiagnosticoSesionExtendida; 