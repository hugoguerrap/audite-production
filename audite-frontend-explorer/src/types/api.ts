// src/types/api.ts
// Definiciones de tipos generadas (simplificadas) basadas en la especificación OpenAPI

// === Auth ===
export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  email: string;
  nombre: string;
  empresa: string;
  id: number;
  is_active?: boolean; // OpenAPI default: true
  created_at: string; // format: date-time
}

export interface UserCreate {
  email: string; // format: email
  nombre: string;
  empresa: string;
  password: string;
}

// === Auditoria Basica ===
export interface AuditoriaBasica {
  id: number;
  nombre_empresa: string;
  sector: string;
  tamano_instalacion: number;
  num_empleados: number;
  consumo_anual: number;
  factura_mensual: number;
  tiene_auditoria_previa: boolean;
  fuentes_energia: string[];
  datos_equipos: {
    tipo_iluminacion: string;
    sistema_hvac: string;
    iluminacion_potencia: number;
    climatizacion_potencia: number;
    edad_promedio_equipos: string;
    mantenimiento_regular: boolean;
  };
  equipment_age: string;
  renewable_energy: boolean;
  energy_priorities: string;
  savings_target: number;
  implementation_budget: string;
  notas: string | null;
  created_at: string;
  usuario_id: number;
  ip_address: string;
  is_complete: boolean;
  intensidad_energetica: number;
  consumo_por_empleado: number;
  costo_por_empleado: number;
  potencial_ahorro: number;
  puntuacion_eficiencia: number;
  distribucion_consumo: Record<string, number>;
  comparacion_benchmark: {
    consumo_promedio_sector: number;
    diferencia_porcentual: number;
  };
  recomendaciones: Recomendacion[];
}

export interface AuditoriaBasicaCreate {
  nombre_empresa: string;
  sector: string;
  tamano_instalacion: number;
  num_empleados: number;
  consumo_anual: number;
  factura_mensual: number;
  tiene_auditoria_previa: boolean;
  fuentes_energia: string[];
  datos_equipos: {
    tipo_iluminacion: string;
    sistema_hvac: string;
    iluminacion_potencia: number;
    climatizacion_potencia: number;
    edad_promedio_equipos: string;
    mantenimiento_regular: boolean;
  };
  equipment_age: string;
  renewable_energy: boolean;
  energy_priorities: string;
  savings_target: number;
  implementation_budget: string;
  notas?: string | null;
}

// === Auditoria Agro ===
export interface Recomendacion {
  categoria: string;
  titulo: string;
  descripcion: string;
  ahorro_estimado?: number | null;
  costo_implementacion: string;
  periodo_retorno?: number | null;
  prioridad: number;
  id: number;
  auditoria_basica_id?: number | null;
  auditoria_agro_id?: number | null;
  created_at: string; // format: date-time
}

export interface ConsumoPorFuente {
  equipo_id: number;
  fuente_energia: string;
  consumo: number;
  unidad: string;
}

export interface AuditoriaAgro {
  id: number;
  usuario_id: number;
  created_at: string;
  updated_at: string;

  // Datos básicos
  nombre_proyecto: string;
  ubicacion: string;
  area_total: number;
  tipo_cultivo: string;
  produccion_anual: number;
  unidad_produccion: string;

  // Consumos energéticos
  consumo_electrico: number;
  consumo_combustible: number;
  consumo_agua: number;

  // Distribución de consumo
  distribucion_consumo: {
    Campo: number;
    Planta: number;
    Plantel: number;
    Faenamiento: number;
    Proceso: number;
    Distribucion: number;
  };

  // Equipamiento
  equipos: {
    tractores: number;
    bombas_riego: number;
    sistemas_ventilacion: number;
    equipos_procesamiento: number;
  };

  sistemas_riego: {
    tipo: string;
    cobertura: number;
    eficiencia_actual: number;
    antiguedad: number;
  };

  // Estado y características
  tiene_certificacion: boolean;
  tiene_mantenimiento: boolean;
  tiene_automatizacion: boolean;
  observaciones?: string;

  // Campos calculados
  consumo_total: number;
  kpi_por_produccion: number;
  kpi_por_area: number;
  potencial_ahorro: number;
  puntuacion_eficiencia: number;
  huella_carbono: number;
  eficiencia_riego: number;
  costo_energia_por_produccion: number;

  // Benchmark y comparaciones
  comparacion_benchmark: {
    consumo_promedio_sector: number;
    eficiencia_riego_referencia: number;
    diferencia_porcentual: number;
  };

  // Recomendaciones
  recomendaciones: Array<{
    id: number;
    categoria: string;
    titulo: string;
    descripcion: string;
    ahorro_estimado: number;
    costo_implementacion: string;
    periodo_retorno: number;
    prioridad: number;
  }>;
}

export interface Equipo {
  tipo: string;
  horas_uso: number;
  consumo_combustible: number;
}

export interface DatosConsumo {
  electricidad: number;
  combustible: number;
  agua: number;
}

export interface SistemaRiego {
  tipo: string;
  consumo_agua: number;
  eficiencia: number;
}

export type AuditoriaAgroCreate = Omit<AuditoriaAgro, 'id' | 'created_at' | 'updated_at' | 'kpi_por_produccion' | 'kpi_por_area' | 'consumo_total' | 'distribucion_consumo'>;

export type AuditoriaAgroUpdate = Partial<AuditoriaAgroCreate>;

// === Agro Data ===
export interface AgroIndustryType {
  sector: string;
  subsector: string;
  producto: string;
  kpi1_unidad?: string | null;
  kpi2_unidad?: string | null;
  id: number;
  created_at?: string | null; // format: date-time
}

export interface AgroEquipment {
  sector: string;
  equipo: string;
  fuentes_energia: string[];
  id: number;
  created_at?: string | null; // format: date-time
  consumos?: ConsumoPorFuente[] | null; // Relación (puede no venir siempre)
}

export interface AgroProcess {
  etapa: string;
  nombre: string;
  id: number;
  created_at?: string | null; // format: date-time
}

export interface AgroEquipmentCategory {
  categoria: string;
  equipo_especifico: string;
  id: number;
  created_at?: string | null; // format: date-time
}

export interface AgroEtapaSubsector {
    etapa: string;
    subsector: string;
    id: number;
    created_at?: string | null; // format: date-time
}

export interface ProcesoProducto {
    proceso_id: number;
    producto_id: number;
    consumo_referencia?: number | null;
    unidad_consumo?: string | null;
}

// === Admin ===
export interface Benchmark {
  sector_id: number;
  consumo_promedio: number;
  consumo_optimo: number;
  unidad_medida: string;
  año: number;
  fuente?: string | null;
  id: number;
  created_at: string; // format: date-time
  updated_at: string; // format: date-time
}

export interface ParametrosSistema {
  categoria: string;
  nombre: string;
  valor: Record<string, any>; // additionalProperties: true
  descripcion?: string | null;
  id: number;
  created_at: string; // format: date-time
  updated_at: string; // format: date-time
}

// === Error Handling ===
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

// === OpenAPI Spec Root ===
// No es un tipo de dato per se, pero representa la estructura devuelta por /openapi.json
export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  paths: Record<string, any>; // Simplificado
  components: Record<string, any>; // Simplificado
}

// === Diagnóstico Feria ===

export interface FairContactInfoPayload {
  ubicacion: string;
  cargo: string;
  nombre_completo: string;
  telefono?: string | null;
  email_contacto?: string | null; // format: email
  nombre_empresa_contacto?: string | null;
}

export interface FairIniciarContactoResponse {
  id: string;
  accessCode: string;
}

export interface FairBackgroundData {
  hasPreviousAudits: boolean;
  mainInterest: string;
  // TODO: Completar con más campos si existen
}

export interface FairProductionData {
  productType: string;
  exportProducts: boolean;
  processesOfInterest: string[];
  // TODO: Completar con más campos si existen
}

export interface FairEquipmentData {
  mostIntensiveEquipment: string;
  energyConsumption: number;
  specificEquipmentMeasured: string;
  // TODO: Completar con más campos si existen
}

export interface FairRenewableData {
  interestedInRenewable: boolean;
  electricTariff: string;
  penaltiesReceived: boolean;
  penaltyCount: number;
  // TODO: Completar con más campos si existen
}

export interface FairEnergyCostsData {
  electricity: number;
  fuel: number;
  others: string;
}

export interface FairVolumeData {
  annualProduction: number;
  productionUnit: string;
  energyCosts: FairEnergyCostsData;
  energyCostPercentage: number;
  // TODO: Completar con más campos si existen
}

export interface FairMetadata {
  browser: string;
  deviceType: string;
  fairLocation: string;
  fairName: string;
  // No suelen haber más campos aquí a menos que se envíen explícitamente
}

export interface FairDiagnosticoCompletarRequest {
  background: FairBackgroundData;
  production: FairProductionData;
  equipment: FairEquipmentData;
  renewable: FairRenewableData;
  volume: FairVolumeData;
  metadata?: FairMetadata;
}

export interface FairResultadosDiagnostico {
  intensidadEnergetica: number;
  costoEnergiaAnual: number;
  potencialAhorro: number;
  puntuacionEficiencia: number;
  comparacionSector: {
    consumoPromedioSector: number;
    diferenciaPorcentual: number;
    eficienciaReferencia: number;
    // TODO: Completar con más campos si existen
  };
  // TODO: Completar con más campos si existen
}

export interface FairRecomendacionDiagnostico {
  id: string; 
  categoria: string;
  titulo: string;
  descripcion: string;
  ahorroEstimado?: number | null;
  costoImplementacion?: string | null; 
  periodoRetorno?: number | null;
  prioridad?: number | null;
  // TODO: Completar con más campos si existen
}

export interface FairDiagnosticoResponse {
  id: string; 
  createdAt: string; // format: date-time
  accessCode: string;
  contactInfo: FairContactInfoPayload;
  background: FairBackgroundData;
  production: FairProductionData;
  equipment: FairEquipmentData;
  renewable: FairRenewableData;
  volume: FairVolumeData;
  metadata?: FairMetadata;
  results: FairResultadosDiagnostico;
  recomendaciones: FairRecomendacionDiagnostico[];
  pdfUrl?: string | null;
  viewUrl?: string | null;
} 