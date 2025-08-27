/**
 * Tipos TypeScript para el sistema de formularios por industria
 * Incluye interfaces para categorías, formularios, preguntas condicionales y respuestas
 */

// ============================================================================
// TIPOS BASE PARA CATEGORÍAS DE INDUSTRIA
// ============================================================================

export interface CategoriaIndustria {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string; // Código hexadecimal para UI
  activa: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
  // Relaciones opcionales
  formularios?: FormularioIndustria[];
}

export interface CategoriaIndustriaCreate {
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  activa?: boolean;
  orden: number;
}

export interface CategoriaIndustriaUpdate {
  nombre?: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  activa?: boolean;
  orden?: number;
}

export interface CategoriaIndustriaListResponse {
  categorias: CategoriaIndustria[];
  total: number;
}

// ============================================================================
// TIPOS PARA FORMULARIOS POR INDUSTRIA
// ============================================================================

export interface FormularioIndustria {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
  tiempo_estimado?: number; // En minutos
  created_at: string;
  updated_at: string;
  // Relaciones
  categoria?: CategoriaIndustria;
  preguntas?: PreguntaFormulario[];
}

export interface FormularioIndustriaCreate {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  orden: number;
  tiempo_estimado?: number;
}

export interface FormularioIndustriaUpdate {
  categoria_id?: number;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  orden?: number;
  tiempo_estimado?: number;
}

export interface FormularioIndustriaDetail extends FormularioIndustria {
  total_preguntas: number;
  preguntas_condicionales: number;
  total_respuestas: number;
}

// ============================================================================
// TIPOS PARA PREGUNTAS CON LÓGICA CONDICIONAL
// ============================================================================

export type TipoPregunta = 
  | 'radio' 
  | 'checkbox' 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'ordering'
  | 'textarea'
  | 'email'
  | 'tel';

export type OperadorCondicional = '=' | '!=' | 'includes' | 'not_includes';

export interface CondicionPregunta {
  valor: any; // Valor esperado para activar la condición
  operador?: OperadorCondicional;
  multiple?: boolean; // Para respuestas múltiples
}

export interface PreguntaFormulario {
  id: number;
  formulario_id: number;
  texto: string;
  subtitulo?: string;
  tipo: TipoPregunta;
  opciones?: string[]; // Para radio, checkbox, select
  tiene_opcion_otro: boolean;
  placeholder_otro?: string;
  orden: number;
  requerida: boolean;
  activa: boolean;
  // Campos condicionales
  pregunta_padre_id?: number;
  condicion_valor?: CondicionPregunta;
  condicion_operador?: OperadorCondicional;
  created_at: string;
  updated_at: string;
  // Relaciones
  formulario?: FormularioIndustria;
  pregunta_padre?: PreguntaFormulario;
  preguntas_hijas?: PreguntaFormulario[];
}

export interface PreguntaFormularioCreate {
  formulario_id: number;
  texto: string;
  subtitulo?: string;
  tipo: TipoPregunta;
  opciones?: string[];
  tiene_opcion_otro?: boolean;
  placeholder_otro?: string;
  orden: number;
  requerida?: boolean;
  activa?: boolean;
  pregunta_padre_id?: number;
  condicion_valor?: CondicionPregunta;
  condicion_operador?: OperadorCondicional;
}

export interface PreguntaFormularioUpdate {
  formulario_id?: number;
  texto?: string;
  subtitulo?: string;
  tipo?: TipoPregunta;
  opciones?: string[];
  tiene_opcion_otro?: boolean;
  placeholder_otro?: string;
  orden?: number;
  requerida?: boolean;
  activa?: boolean;
  pregunta_padre_id?: number;
  condicion_valor?: CondicionPregunta;
  condicion_operador?: OperadorCondicional;
}

export interface PreguntaCondicional extends PreguntaFormulario {
  // Información adicional para renderizado condicional
  es_condicional: boolean;
  debe_mostrar: boolean;
  dependientes: number[]; // IDs de preguntas que dependen de esta
  nivel_dependencia: number; // Qué tan profunda es la dependencia
  padre_texto?: string; // Texto de la pregunta padre para referencia
}

// ============================================================================
// TIPOS PARA RESPUESTAS Y SESIONES
// ============================================================================

export interface RespuestaFormulario {
  id?: number;
  session_id: string;
  pregunta_id: number;
  valor_respuesta: any; // Valor principal de la respuesta
  valor_otro?: string; // Valor del campo "Otro" si aplica
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  // Relaciones
  pregunta?: PreguntaFormulario;
}

export interface RespuestaFormularioCreate {
  pregunta_id: number;
  valor_respuesta: any;
  valor_otro?: string;
}

export interface EnvioRespuestasRequest {
  session_id: string;
  formulario_id: number;
  respuestas: RespuestaFormularioCreate[];
}

// ============================================================================
// TIPOS PARA ESTADOS DE FORMULARIO Y NAVEGACIÓN
// ============================================================================

export type EstadoFormulario = 
  | 'no_iniciado'
  | 'en_progreso' 
  | 'completado'
  | 'error';

export type EstadoSesion = 
  | 'no_iniciada'
  | 'iniciada'
  | 'en_progreso' 
  | 'completada'
  | 'abandonada';

export interface EstadoSesionResponse {
  session_id: string;
  existe: boolean;
  respuestas_totales: number;
  progreso_porcentaje: number;
  estado: EstadoSesion;
  formulario_id?: number;
  formulario_nombre?: string;
  categoria_industria?: string;
  fecha_inicio?: string;
  fecha_ultima_respuesta?: string;
}

export interface ProgresoDiagnostico {
  paso_actual: number;
  total_pasos: number;
  porcentaje: number;
  preguntas_respondidas: number;
  preguntas_visibles: number;
  tiempo_transcurrido?: number; // En minutos
  tiempo_estimado_restante?: number;
}

// ============================================================================
// TIPOS PARA SUGERENCIAS POR INDUSTRIA
// ============================================================================

export interface SugerenciaIndustria {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  beneficio_estimado: string;
  prioridad: 'alta' | 'media' | 'baja';
  acciones: string[];
  inversion_estimada: 'Baja' | 'Media' | 'Alta' | 'Baja-Media' | 'Media-Alta';
  tiempo_implementacion: string;
}

export interface PlanImplementacion {
  fases: {
    inmediata: SugerenciaIndustria[];      // 0-3 meses
    corto_plazo: SugerenciaIndustria[];    // 3-6 meses
    mediano_plazo: SugerenciaIndustria[];  // 6+ meses
  };
  inversion_total_estimada: string;
  ahorro_total_estimado: string;
  tiempo_total: string;
}

export interface SugerenciasResponse {
  session_id: string;
  formulario_id: number;
  categoria_industria: string;
  total_sugerencias: number;
  sugerencias: SugerenciaIndustria[];
  plan_implementacion: PlanImplementacion;
  fecha_generacion: string;
  metadata: {
    respuestas_procesadas: number;
    tiempo_formulario?: number;
    categoria_color?: string;
  };
}

// ============================================================================
// TIPOS PARA VALIDACIÓN Y ERRORES
// ============================================================================

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
  codigo?: string;
}

export interface ValidacionCondicional {
  valido: boolean;
  errores: string[];
  preguntas_faltantes: Array<{
    id: number;
    texto: string;
    razon: string;
  }>;
  preguntas_sobrantes: Array<{
    id: number;
    razon: string;
  }>;
}

export interface ValidacionDependencias {
  valida: boolean;
  errores: string[];
  advertencias: string[];
}

// ============================================================================
// TIPOS PARA ANÁLISIS ADMIN
// ============================================================================

export interface EstadisticasFormulario {
  formulario_id: number;
  formulario_nombre: string;
  categoria_industria?: string;
  total_preguntas: number;
  preguntas_condicionales: number;
  estadisticas_respuestas: {
    total_sesiones: number;
    sesiones_completas: number;
    tasa_completacion: number;
    tiempo_promedio: number;
    por_pregunta: Array<{
      pregunta_id: number;
      pregunta_texto: string;
      total_respuestas: number;
      respuestas_por_opcion?: Record<string, number>;
      tiempo_promedio_respuesta?: number;
    }>;
  };
  fecha_consulta: string;
}

export interface AnalisisCondicionales {
  formulario_id: number;
  resumen: {
    total_preguntas: number;
    preguntas_base: number;
    preguntas_condicionales: number;
    porcentaje_condicionales: number;
  };
  mapa_dependencias: Record<number, Array<{
    id: number;
    texto: string;
    condicion: string;
    activa: boolean;
  }>>;
  problemas_detectados: Array<{
    pregunta_id: number;
    texto: string;
    errores: string[];
    advertencias: string[];
  }>;
  recomendaciones: string[];
  fecha_analisis: string;
}

// ============================================================================
// TIPOS UTILITARIOS Y HELPERS
// ============================================================================

export interface RespuestaConOtro {
  valor: any;
  otro?: string;
}

export interface ConfiguracionFormulario {
  mostrar_progreso: boolean;
  permitir_retroceso: boolean;
  guardar_automatico: boolean;
  tiempo_limite?: number; // En minutos
  validar_en_tiempo_real: boolean;
}

export interface MetadataFormulario {
  version: string;
  autor: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  tags?: string[];
  descripcion_cambios?: string;
}

// ============================================================================
// TIPOS PARA HOOKS Y ESTADO
// ============================================================================

export interface UseDiagnosticoIndustriaState {
  // Estado de categorías
  categorias: CategoriaIndustria[];
  categoriaSeleccionada?: CategoriaIndustria;
  cargandoCategorias: boolean;
  
  // Estado de formularios
  formularios: FormularioIndustria[];
  formularioSeleccionado?: FormularioIndustria;
  cargandoFormularios: boolean;
  
  // Estado de preguntas
  preguntas: PreguntaCondicional[];
  preguntasVisibles: PreguntaCondicional[];
  cargandoPreguntas: boolean;
  
  // Estado de respuestas
  respuestas: Record<number, RespuestaConOtro>;
  sessionId: string;
  enviandoRespuestas: boolean;
  
  // Estado de progreso
  progreso: ProgresoDiagnostico;
  estadoFormulario: EstadoFormulario;
  
  // Estado de sugerencias
  sugerencias?: SugerenciasResponse;
  cargandoSugerencias: boolean;
  
  // Estado de errores
  error?: string;
  erroresValidacion: ErrorValidacion[];
}

export interface UseOtroFieldsState {
  campos_otro: Record<number, string>; // pregunta_id -> valor_otro
  campos_visibles: Record<number, boolean>; // pregunta_id -> mostrar_otro
}

// ============================================================================
// EXPORTS DISPONIBLES
// ============================================================================

/**
 * Este archivo exporta todos los tipos necesarios para el sistema de 
 * formularios por industria. Los tipos se organizan en:
 * 
 * - Categorías y formularios base
 * - Preguntas con lógica condicional  
 * - Respuestas y sesiones
 * - Estados de formulario
 * - Sugerencias por industria
 * - Validación y errores
 * - Análisis admin
 * - Hooks y estado
 */ 