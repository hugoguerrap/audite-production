from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Union

# Esquemas para Usuario
class UserBase(BaseModel):
    email: EmailStr
    nombre: str
    empresa: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

# Esquemas para Auditoría Básica
class AuditoriaBasicaBase(BaseModel):
    nombre_empresa: str
    sector: str
    tamano_instalacion: float = Field(description="Tamaño de la instalación en metros cuadrados")
    num_empleados: int
    consumo_anual: float = Field(description="Consumo energético anual en kWh")
    factura_mensual: float = Field(description="Factura mensual de energía")
    tiene_auditoria_previa: bool = False
    fuentes_energia: List[str] = Field(description="Lista de fuentes de energía utilizadas")
    datos_equipos: Dict[str, Union[str, bool, float]] = Field(description="Información sobre equipos")
    notas: Optional[str] = None
    
    # Nuevos campos opcionales
    equipment_age: Optional[str] = None
    renewable_energy: bool = False
    energy_priorities: Optional[str] = None
    savings_target: Optional[float] = None
    implementation_budget: Optional[str] = None

class AuditoriaBasicaCreate(AuditoriaBasicaBase):
    pass

class AuditoriaBasica(AuditoriaBasicaBase):
    id: int
    usuario_id: Optional[int] = None
    created_at: datetime
    ip_address: Optional[str] = None
    is_complete: bool = False
    renewable_energy: bool = False
    intensidad_energetica: float = Field(description="kWh/m²")
    consumo_por_empleado: float = Field(description="kWh/empleado")
    costo_por_empleado: float = Field(description="$/empleado")
    potencial_ahorro: float = Field(description="Porcentaje de ahorro potencial")
    puntuacion_eficiencia: float = Field(description="Puntaje de 0 a 100")
    distribucion_consumo: Dict[str, float] = Field(description="Distribución del consumo por área")
    comparacion_benchmark: Dict[str, float]
    equipment_age: Optional[str] = None
    energy_priorities: Optional[str] = None
    savings_target: Optional[float] = None
    implementation_budget: Optional[str] = None

    class Config:
        from_attributes = True

class RecomendacionBase(BaseModel):
    categoria: str
    titulo: str
    descripcion: str
    ahorro_estimado: Optional[float] = None
    costo_implementacion: str
    periodo_retorno: Optional[float] = None
    prioridad: int

class RecomendacionCreate(RecomendacionBase):
    pass

class Recomendacion(RecomendacionBase):
    id: int
    auditoria_basica_id: Optional[int] = None
    auditoria_agro_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Esquemas para Auditoría Agro
class ConsumoPorFuente(BaseModel):
    equipo_id: int
    fuente_energia: str
    consumo: float
    unidad: str

    class Config:
        from_attributes = True

class ProcesoProducto(BaseModel):
    proceso_id: int
    producto_id: int
    consumo_referencia: Optional[float] = None
    unidad_consumo: Optional[str] = None

    class Config:
        from_attributes = True

class AuditoriaAgroBase(BaseModel):
    nombre_proyecto: str
    ubicacion: str
    area_total: float = Field(description="Área total en hectáreas")
    tipo_cultivo: str
    consumo_electrico: float = Field(description="Consumo eléctrico anual en kWh")
    consumo_combustible: float = Field(description="Consumo de combustible anual en litros")
    consumo_agua: float = Field(description="Consumo de agua anual en m³")
    equipos: Dict[str, int] = Field(description="Cantidad de equipos por tipo")
    sistemas_riego: Dict[str, Union[str, float]] = Field(description="Información del sistema de riego")
    produccion_anual: float
    unidad_produccion: str
    tiene_certificacion: bool = False
    tiene_mantenimiento: bool = False
    tiene_automatizacion: bool = False
    observaciones: Optional[str] = None
    
    # Consumos por etapa
    consumo_campo: Optional[float] = Field(default=None, description="kWh/año")
    consumo_planta: Optional[float] = Field(default=None, description="kWh/año")
    consumo_plantel: Optional[float] = Field(default=None, description="kWh/año")
    consumo_faenamiento: Optional[float] = Field(default=None, description="kWh/año")
    consumo_proceso: Optional[float] = Field(default=None, description="kWh/año")
    consumo_distribucion: Optional[float] = Field(default=None, description="kWh/año")

class AuditoriaAgroCreate(BaseModel):
    nombre_proyecto: str
    ubicacion: str
    area_total: float
    tipo_cultivo: str
    consumo_electrico: float
    consumo_combustible: float
    consumo_agua: float
    equipos: Dict[str, int]
    sistemas_riego: Dict[str, Union[str, float]]
    produccion_anual: float
    unidad_produccion: str
    tiene_certificacion: bool = False
    tiene_mantenimiento: bool = False
    tiene_automatizacion: bool = False
    observaciones: Optional[str] = None
    consumo_campo: Optional[float] = None
    consumo_planta: Optional[float] = None
    consumo_plantel: Optional[float] = None
    consumo_faenamiento: Optional[float] = None
    consumo_proceso: Optional[float] = None
    consumo_distribucion: Optional[float] = None

class AuditoriaAgroUpdate(BaseModel):
    nombre_proyecto: Optional[str] = None
    area_total: Optional[float] = None
    consumo_electrico: Optional[float] = None
    consumo_combustible: Optional[float] = None
    consumo_agua: Optional[float] = None
    equipos: Optional[Dict[str, int]] = None
    sistemas_riego: Optional[Dict[str, Union[str, float]]] = None
    tiene_mantenimiento: Optional[bool] = None
    tiene_automatizacion: Optional[bool] = None
    observaciones: Optional[str] = None

class AuditoriaAgro(AuditoriaAgroBase):
    id: int
    usuario_id: int
    created_at: datetime
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Campos calculados básicos
    consumo_total: float = Field(description="Consumo total en kWh/año")
    kpi_por_produccion: float = Field(description="kWh/unidad de producción")
    kpi_por_area: float = Field(description="kWh/hectárea")
    distribucion_consumo: Dict[str, float] = Field(description="Distribución del consumo por etapa")
    
    # Nuevos campos calculados
    potencial_ahorro: float = Field(description="Porcentaje de ahorro potencial")
    puntuacion_eficiencia: float = Field(description="Puntaje de eficiencia (0-100)")
    huella_carbono: float = Field(description="Huella de carbono en kgCO2e/año")
    eficiencia_riego: float = Field(description="Eficiencia del riego en m³/hectárea")
    costo_energia_por_produccion: float = Field(description="Costo energético por unidad de producción")
    
    # Benchmark y comparaciones
    comparacion_benchmark: Dict[str, float] = Field(description="Comparación con valores de referencia del sector")
    
    # Relaciones
    recomendaciones: List[Recomendacion]
    consumos_por_fuente: Optional[List[ConsumoPorFuente]] = None

    class Config:
        from_attributes = True

# Token de autenticación
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Esquemas para datos precargados
class AgroIndustryTypeBase(BaseModel):
    sector: str = Field(..., description="Sector de la industria (ej: Agroindustria)")
    subsector: str = Field(..., description="Subsector específico (ej: Agroindustria Hortofrutícola)")
    producto: str = Field(..., description="Tipo de producto (ej: Productos frescos)")
    kpi1_unidad: Optional[str] = Field(None, description="Unidad del primer KPI (ej: kWh/caja)")
    kpi2_unidad: Optional[str] = Field(None, description="Unidad del segundo KPI (ej: kWh/Ton)")

class AgroIndustryTypeCreate(AgroIndustryTypeBase):
    pass

class AgroIndustryType(AgroIndustryTypeBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AgroEquipmentBase(BaseModel):
    sector: str = Field(..., description="Sector al que pertenece el equipo")
    equipo: str = Field(..., description="Nombre del equipo")
    fuentes_energia: List[str] = Field(..., description="Lista de posibles fuentes de energía del equipo")

class AgroEquipmentCreate(AgroEquipmentBase):
    pass

class AgroEquipment(AgroEquipmentBase):
    id: int
    created_at: Optional[datetime] = None
    consumos: Optional[List[ConsumoPorFuente]] = None

    class Config:
        from_attributes = True

class AgroProcessBase(BaseModel):
    etapa: str = Field(..., description="Etapa del proceso (ej: Campo, Planta de procesamiento)")
    nombre: str = Field(..., description="Nombre del proceso específico")

class AgroProcessCreate(AgroProcessBase):
    productos: Optional[List[int]] = Field(None, description="Lista de IDs de productos relacionados")

class AgroProcess(AgroProcessBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AgroEquipmentCategoryBase(BaseModel):
    categoria: str = Field(..., description="Categoría del equipo")
    equipo_especifico: str = Field(..., description="Equipo específico dentro de la categoría")

class AgroEquipmentCategoryCreate(AgroEquipmentCategoryBase):
    pass

class AgroEquipmentCategory(AgroEquipmentCategoryBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AgroEtapaSubsectorBase(BaseModel):
    etapa: str = Field(..., description="Etapa del proceso")
    subsector: str = Field(..., description="Subsector relacionado")

class AgroEtapaSubsectorCreate(AgroEtapaSubsectorBase):
    pass

class AgroEtapaSubsector(AgroEtapaSubsectorBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Esquemas para el Panel de Control

class SectorIndustrialBase(BaseModel):
    nombre: str
    descripcion: str | None = None

class SectorIndustrialCreate(SectorIndustrialBase):
    pass

class SectorIndustrial(SectorIndustrialBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BenchmarkBase(BaseModel):
    sector_id: int
    consumo_promedio: float
    consumo_optimo: float
    unidad_medida: str
    año: int
    fuente: str | None = None

class BenchmarkCreate(BenchmarkBase):
    pass

class Benchmark(BenchmarkBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TipoEquipoBase(BaseModel):
    nombre: str
    categoria: str
    descripcion: str | None = None
    potencia_tipica: float
    unidad_potencia: str
    eficiencia_tipica: float
    vida_util: int

class TipoEquipoCreate(TipoEquipoBase):
    pass

class TipoEquipo(TipoEquipoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PlantillaRecomendacionBase(BaseModel):
    categoria: str
    titulo: str
    descripcion: str
    ahorro_estimado_min: float
    ahorro_estimado_max: float
    costo_implementacion: str
    periodo_retorno_tipico: float
    prioridad: int
    condiciones_aplicacion: dict

class PlantillaRecomendacionCreate(PlantillaRecomendacionBase):
    pass

class PlantillaRecomendacion(PlantillaRecomendacionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ParametrosSistemaBase(BaseModel):
    categoria: str
    nombre: str
    valor: dict
    descripcion: str | None = None

class ParametrosSistemaCreate(ParametrosSistemaBase):
    pass

class ParametrosSistema(ParametrosSistemaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Schemas para Diagnóstico de Feria
class ContactInfo(BaseModel):
    ubicacion: str
    cargo: str
    nombre_completo: str
    telefono: Optional[str] = None
    email_contacto: Optional[str] = None
    nombre_empresa_contacto: Optional[str] = None

class Background(BaseModel):
    hasPreviousAudits: bool
    mainInterest: str

class Production(BaseModel):
    productType: str
    exportProducts: bool
    processesOfInterest: List[str]

class Equipment(BaseModel):
    mostIntensiveEquipment: str
    energyConsumption: float
    specificEquipmentMeasured: Optional[str] = None

class Renewable(BaseModel):
    interestedInRenewable: bool
    electricTariff: str
    penaltiesReceived: bool
    penaltyCount: Optional[int] = None

class EnergyCosts(BaseModel):
    electricity: float
    fuel: float
    others: Optional[str] = None

class Volume(BaseModel):
    annualProduction: float
    productionUnit: str
    energyCosts: EnergyCosts
    energyCostPercentage: float

class Metadata(BaseModel):
    browser: str
    deviceType: str
    fairLocation: Optional[str] = None
    fairName: Optional[str] = None

class DiagnosticoFeriaCreate(BaseModel):
    contactInfo: ContactInfo
    background: Background
    production: Production
    equipment: Equipment
    renewable: Renewable
    volume: Volume
    metadata: Metadata

class ComparacionSector(BaseModel):
    consumoPromedioSector: float
    diferenciaPorcentual: float
    eficienciaReferencia: float

class ResultadosDiagnostico(BaseModel):
    intensidadEnergetica: float
    costoEnergiaAnual: float
    potencialAhorro: float
    puntuacionEficiencia: float
    comparacionSector: ComparacionSector

class RecomendacionDiagnostico(BaseModel):
    id: str
    categoria: str
    titulo: str
    descripcion: str
    ahorroEstimado: float
    costoImplementacion: str
    periodoRetorno: float
    prioridad: int

class DiagnosticoFeriaResponse(BaseModel):
    id: str
    createdAt: str
    accessCode: str
    contactInfo: ContactInfo
    background: Background
    production: Production
    equipment: Equipment
    renewable: Renewable
    volume: Volume
    results: ResultadosDiagnostico
    recomendaciones: List[RecomendacionDiagnostico]
    pdfUrl: Optional[str] = None
    viewUrl: str

# Schema para la respuesta del endpoint de iniciar contacto
class DiagnosticoFeriaIniciarContactoResponse(BaseModel):
    id: str
    accessCode: str

# Schema para el request body del endpoint de completar diagnóstico
# Asegúrate de que los tipos (Background, Production, etc.) coincidan con tus schemas definidos
class DiagnosticoFeriaCompletarRequest(BaseModel):
    background: Background
    production: Production
    equipment: Equipment
    renewable: Renewable
    volume: Volume
    metadata: Metadata # Considera si metadata debe ser parte de esta actualización o solo de la creación inicial

    # Configuración para Pydantic V1 (si la usas y necesitas compatibilidad ORM)
    # class Config:
    #     orm_mode = True
    # Configuración para Pydantic V2 (si la usas y necesitas compatibilidad ORM):
    # model_config = {"from_attributes": True} 

# Schemas para el sistema de autodiagnóstico

class AutodiagnosticoOpcionBase(BaseModel):
    texto_opcion: str = Field(..., max_length=200, description="Texto de la opción")
    valor: str = Field(..., max_length=100, description="Valor que se guardará")
    es_por_defecto: bool = Field(default=False, description="Si es la opción por defecto")
    es_especial: bool = Field(default=False, description="Para opciones como 'No sé', 'Otro'")
    orden: int = Field(..., description="Orden de la opción")
    es_activa: bool = Field(default=True, description="Si la opción está activa")
    tiene_sugerencia: bool = Field(default=False, description="Si esta opción tiene una sugerencia")
    sugerencia: Optional[str] = Field(None, description="Texto de la sugerencia/recomendación")

class AutodiagnosticoOpcionCreate(AutodiagnosticoOpcionBase):
    pass

class AutodiagnosticoOpcionUpdate(BaseModel):
    texto_opcion: Optional[str] = None
    valor: Optional[str] = None
    es_por_defecto: Optional[bool] = None
    es_especial: Optional[bool] = None
    orden: Optional[int] = None
    es_activa: Optional[bool] = None
    tiene_sugerencia: Optional[bool] = None
    sugerencia: Optional[str] = None

class AutodiagnosticoOpcion(AutodiagnosticoOpcionBase):
    id: int
    pregunta_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AutodiagnosticoPreguntaBase(BaseModel):
    numero_orden: int = Field(..., description="Número de orden de la pregunta")
    pregunta: str = Field(..., description="Texto de la pregunta")
    tipo_respuesta: str = Field(..., description="Tipo de respuesta: radio, checkbox, text, number, select")
    es_obligatoria: bool = Field(default=True, description="Si la pregunta es obligatoria")
    es_activa: bool = Field(default=True, description="Si la pregunta está activa")
    ayuda_texto: Optional[str] = Field(None, description="Texto de ayuda adicional")

class AutodiagnosticoPreguntaCreate(AutodiagnosticoPreguntaBase):
    opciones: List[AutodiagnosticoOpcionCreate] = Field(default=[], description="Lista de opciones")

class AutodiagnosticoPreguntaUpdate(BaseModel):
    numero_orden: Optional[int] = None
    pregunta: Optional[str] = None
    tipo_respuesta: Optional[str] = None
    es_obligatoria: Optional[bool] = None
    es_activa: Optional[bool] = None
    ayuda_texto: Optional[str] = None
    opciones: Optional[List[AutodiagnosticoOpcionCreate]] = None

class AutodiagnosticoPregunta(AutodiagnosticoPreguntaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    opciones: List[AutodiagnosticoOpcion] = Field(default=[], description="Lista de opciones")

    class Config:
        from_attributes = True

class AutodiagnosticoRespuestaBase(BaseModel):
    session_id: str = Field(..., description="ID de sesión único")
    pregunta_id: int = Field(..., description="ID de la pregunta")
    respuesta_texto: Optional[str] = Field(None, description="Respuesta de texto libre")
    respuesta_numero: Optional[float] = Field(None, description="Respuesta numérica")
    opciones_seleccionadas: Optional[List[str]] = Field(None, description="Opciones seleccionadas (checkbox)")
    opcion_seleccionada: Optional[str] = Field(None, description="Opción seleccionada (radio/select)")
    archivo_adjunto: Optional[str] = Field(None, description="URL del archivo adjunto")

class AutodiagnosticoRespuestaCreate(AutodiagnosticoRespuestaBase):
    pass

class AutodiagnosticoRespuesta(AutodiagnosticoRespuestaBase):
    id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    pregunta: AutodiagnosticoPregunta

    class Config:
        from_attributes = True

# Schema para enviar todas las respuestas de una sesión
class AutodiagnosticoSesionCreate(BaseModel):
    respuestas: List[AutodiagnosticoRespuestaCreate] = Field(..., description="Lista de respuestas")
    metadata: Optional[dict] = Field(None, description="Metadatos adicionales")

# Schema para obtener todas las respuestas de una sesión
class AutodiagnosticoSesion(BaseModel):
    session_id: str
    respuestas: List[AutodiagnosticoRespuesta]
    created_at: datetime
    total_preguntas: int
    preguntas_respondidas: int
    completado: bool

    class Config:
        from_attributes = True

# Schema para estadísticas del admin
class AutodiagnosticoEstadisticas(BaseModel):
    total_preguntas: int
    preguntas_activas: int
    total_sesiones: int
    sesiones_completadas: int
    respuestas_por_pregunta: Dict[int, int]
    respuestas_mas_comunes: Dict[int, List[Dict[str, Union[str, int]]]]

    class Config:
        from_attributes = True

# Schemas para sugerencias
class AutodiagnosticoSugerencia(BaseModel):
    pregunta_id: int
    pregunta: str
    opcion_seleccionada: str
    sugerencia: str

    class Config:
        from_attributes = True

class AutodiagnosticoResultadosConSugerencias(BaseModel):
    session_id: str
    respuestas: List[AutodiagnosticoRespuesta]
    sugerencias: List[AutodiagnosticoSugerencia]
    total_sugerencias: int
    created_at: datetime

    class Config:
        from_attributes = True

# Schema para obtener sugerencias basadas en respuestas
class AutodiagnosticoObtenerSugerenciasRequest(BaseModel):
    session_id: str = Field(..., description="ID de sesión para obtener las sugerencias")

class AutodiagnosticoObtenerSugerenciasResponse(BaseModel):
    session_id: str
    sugerencias: List[AutodiagnosticoSugerencia]
    total_sugerencias: int
    fecha_generacion: datetime

    class Config:
        from_attributes = True


# ========================================
# SCHEMAS: FORMULARIOS POR INDUSTRIA
# ========================================

# Schemas para CategoriaIndustria
class CategoriaIndustriaBase(BaseModel):
    nombre: str = Field(..., max_length=100, description="Nombre de la categoría de industria")
    descripcion: Optional[str] = Field(None, description="Descripción detallada de la categoría")
    icono: Optional[str] = Field(None, max_length=50, description="Emoji o clase CSS para el icono")
    color: Optional[str] = Field(None, max_length=7, description="Color hex para UI (#FFFFFF)")
    activa: bool = Field(True, description="Si la categoría está activa")
    orden: int = Field(0, description="Orden de visualización")

class CategoriaIndustriaCreate(CategoriaIndustriaBase):
    pass

class CategoriaIndustriaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=100)
    descripcion: Optional[str] = None
    icono: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=7)
    activa: Optional[bool] = None
    orden: Optional[int] = None

class CategoriaIndustriaResponse(CategoriaIndustriaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CategoriaIndustriaListResponse(BaseModel):
    categorias: List[CategoriaIndustriaResponse]
    total: int

    class Config:
        from_attributes = True


# Schemas para FormularioIndustria
class FormularioIndustriaBase(BaseModel):
    categoria_id: int = Field(..., description="ID de la categoría de industria")
    nombre: str = Field(..., max_length=200, description="Nombre del formulario")
    descripcion: Optional[str] = Field(None, description="Descripción del formulario")
    activo: bool = Field(True, description="Si el formulario está activo")
    orden: int = Field(0, description="Orden de visualización")
    tiempo_estimado: Optional[int] = Field(None, description="Tiempo estimado en minutos")

class FormularioIndustriaCreate(FormularioIndustriaBase):
    pass

class FormularioIndustriaUpdate(BaseModel):
    categoria_id: Optional[int] = None
    nombre: Optional[str] = Field(None, max_length=200)
    descripcion: Optional[str] = None
    activo: Optional[bool] = None
    orden: Optional[int] = None
    tiempo_estimado: Optional[int] = None

class FormularioIndustriaResponse(FormularioIndustriaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # Incluir relación con categoría
    categoria: Optional[CategoriaIndustriaResponse] = None

    class Config:
        from_attributes = True

class FormularioIndustriaDetailResponse(FormularioIndustriaResponse):
    # Incluir preguntas (se definirá cuando creemos PreguntaFormularioResponse)
    preguntas: Optional[List[dict]] = Field(default_factory=list, description="Lista de preguntas del formulario")

    class Config:
        from_attributes = True


# Schemas para opciones de pregunta
class OpcionPregunta(BaseModel):
    value: str = Field(..., description="Valor interno de la opción")
    label: str = Field(..., description="Texto visible de la opción")
    sugerencia: Optional[str] = Field(None, description="Sugerencia asociada a esta opción")

# Schemas para PreguntaFormulario
class PreguntaFormularioBase(BaseModel):
    formulario_id: int = Field(..., description="ID del formulario al que pertenece")
    texto: str = Field(..., description="Texto de la pregunta")
    subtitulo: Optional[str] = Field(None, description="Texto explicativo adicional")
    tipo: str = Field(..., description="Tipo de pregunta: radio, checkbox, text, number, select, ordering")
    opciones: Optional[List[dict]] = Field(None, description="Opciones para preguntas de selección")
    tiene_opcion_otro: bool = Field(False, description="Si incluye opción 'Otro' con input")
    placeholder_otro: Optional[str] = Field(None, max_length=200, description="Placeholder para campo 'Otro'")
    orden: int = Field(0, description="Orden de la pregunta en el formulario")
    requerida: bool = Field(True, description="Si la pregunta es obligatoria")
    activa: bool = Field(True, description="Si la pregunta está activa")
    # Campos condicionales
    pregunta_padre_id: Optional[int] = Field(None, description="ID de pregunta padre para lógica condicional")
    condicion_valor: Optional[dict] = Field(None, description="Valor y condición para mostrar pregunta")
    condicion_operador: Optional[str] = Field(None, description="Operador de condición: =, !=, includes, not_includes")

class PreguntaFormularioCreate(PreguntaFormularioBase):
    pass

class PreguntaFormularioUpdate(BaseModel):
    formulario_id: Optional[int] = None
    texto: Optional[str] = None
    subtitulo: Optional[str] = None
    tipo: Optional[str] = None
    opciones: Optional[List[dict]] = None
    tiene_opcion_otro: Optional[bool] = None
    placeholder_otro: Optional[str] = Field(None, max_length=200)
    orden: Optional[int] = None
    requerida: Optional[bool] = None
    activa: Optional[bool] = None
    pregunta_padre_id: Optional[int] = None
    condicion_valor: Optional[dict] = None
    condicion_operador: Optional[str] = None

class PreguntaFormularioResponse(PreguntaFormularioBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PreguntaCondicionalResponse(PreguntaFormularioResponse):
    # Incluir información adicional sobre condiciones
    pregunta_padre: Optional[dict] = Field(None, description="Información de la pregunta padre si existe")
    preguntas_hijas: List[dict] = Field(default_factory=list, description="Lista de preguntas que dependen de esta")
    es_condicional: bool = Field(False, description="True si esta pregunta tiene condiciones")
    
    class Config:
        from_attributes = True


# Schemas para RespuestaFormulario
class RespuestaFormularioCreate(BaseModel):
    session_id: str = Field(..., description="UUID de sesión del usuario")
    pregunta_id: int = Field(..., description="ID de la pregunta respondida")
    valor_respuesta: Optional[Union[str, int, float, bool, List[str]]] = Field(None, description="Valor de la respuesta")
    valor_otro: Optional[str] = Field(None, description="Texto ingresado en campo 'Otro'")
    ip_address: Optional[str] = Field(None, max_length=45)
    user_agent: Optional[str] = Field(None, max_length=500)

class RespuestaFormularioResponse(BaseModel):
    id: int
    session_id: str
    pregunta_id: int
    valor_respuesta: Optional[Union[str, int, float, bool, List[str]]]
    valor_otro: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class EnvioRespuestasRequest(BaseModel):
    session_id: str = Field(..., description="UUID de sesión")
    formulario_id: int = Field(..., description="ID del formulario")
    respuestas: List[RespuestaFormularioCreate] = Field(..., description="Lista de respuestas del usuario")
    
    class Config:
        from_attributes = True 