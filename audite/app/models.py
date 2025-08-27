from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, JSON, func, Table, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import json

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    nombre = Column(String(100))
    empresa = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relaciones
    auditorias_basicas = relationship("AuditoriaBasica", back_populates="usuario")
    auditorias_agro = relationship("AuditoriaAgro", back_populates="usuario")

class AuditoriaBasica(Base):
    __tablename__ = "auditorias_basicas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    nombre_empresa = Column(String(100), nullable=False)
    sector = Column(String(50), nullable=False)
    tamano_instalacion = Column(Float, nullable=False)  # en metros cuadrados
    num_empleados = Column(Integer, nullable=False)
    consumo_anual = Column(Float, nullable=False)  # en kWh
    factura_mensual = Column(Float, nullable=False)  # en la moneda local
    tiene_auditoria_previa = Column(Boolean, default=False)
    fuentes_energia = Column(JSON, nullable=False)  # Diccionario de fuentes de energía
    datos_equipos = Column(JSON)  # Información sobre equipos
    notas = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Campos booleanos con valores por defecto
    ip_address = Column(String(45))  # Para IPv6
    is_complete = Column(Boolean, default=False, server_default='false')
    equipment_age = Column(String(50))
    renewable_energy = Column(Boolean, default=False, server_default='false')
    energy_priorities = Column(String(200))
    savings_target = Column(Float)
    implementation_budget = Column(String(50))

    # Campos calculados
    intensidad_energetica = Column(Float)  # kWh/m²
    consumo_por_empleado = Column(Float)  # kWh/empleado
    costo_por_empleado = Column(Float)  # $/empleado
    potencial_ahorro = Column(Float)  # Porcentaje de ahorro potencial
    puntuacion_eficiencia = Column(Float)  # Puntaje de 0 a 100
    distribucion_consumo = Column(JSON)  # Distribución del consumo por área
    comparacion_benchmark = Column(JSON)  # Comparación con el benchmark del sector

    # Relaciones
    usuario = relationship("User", back_populates="auditorias_basicas")
    recomendaciones = relationship("Recomendacion", back_populates="auditoria_basica")

    def get_fuentes_energia(self):
        """Convierte el JSON a diccionario"""
        return self.fuentes_energia if isinstance(self.fuentes_energia, dict) else {}

    def get_datos_equipos(self):
        """Obtiene datos de equipos procesados"""
        if not self.datos_equipos:
            return {}
        
        datos = self.datos_equipos if isinstance(self.datos_equipos, dict) else {}
        equipos_procesados = {}
        
        # Procesar datos de iluminación
        if 'tipo_iluminacion' in datos:
            equipos_procesados['iluminacion'] = {
                'tipo': datos.get('tipo_iluminacion', 'Desconocido'),
                'eficiencia': 'Alta' if datos.get('tipo_iluminacion') == 'LED' else 'Media' if datos.get('tipo_iluminacion') == 'Fluorescente' else 'Baja',
                'costo_reemplazo': 1500 if datos.get('tipo_iluminacion') == 'Incandescente' else 800 if datos.get('tipo_iluminacion') == 'Fluorescente' else 0
            }
        
        # Procesar datos de HVAC
        if 'sistema_hvac' in datos:
            equipos_procesados['hvac'] = {
                'tipo': datos.get('sistema_hvac', 'Desconocido'),
                'eficiencia': 'Alta' if datos.get('sistema_hvac') == 'Moderno' else 'Media' if datos.get('sistema_hvac') == 'Estándar' else 'Baja',
                'costo_reemplazo': 5000 if datos.get('sistema_hvac') == 'Antiguo' else 2500 if datos.get('sistema_hvac') == 'Estándar' else 0
            }
        
        return equipos_procesados

    def calcular_intensidad_energetica(self):
        """Calcula la intensidad energética (kWh/m²)"""
        return self.consumo_anual / self.tamano_instalacion if self.tamano_instalacion > 0 else 0

    def calcular_consumo_por_empleado(self):
        """Calcula el consumo energético por empleado (kWh/empleado)"""
        return self.consumo_anual / self.num_empleados if self.num_empleados > 0 else 0

    def calcular_costo_por_empleado(self):
        """Calcula el costo energético por empleado ($/empleado)"""
        return (self.factura_mensual * 12) / self.num_empleados if self.num_empleados > 0 else 0

    def calcular_potencial_ahorro(self):
        """Calcula el potencial de ahorro basado en múltiples factores"""
        base_potencial = 0.15  # 15% base
        
        # Factores que aumentan el potencial
        if not self.tiene_auditoria_previa:
            base_potencial += 0.05  # +5%
            
        if self.equipment_age == 'mas_10_anos':
            base_potencial += 0.05  # +5%
            
        if not self.renewable_energy:
            base_potencial += 0.03  # +3%
            
        if self.tamano_instalacion > 10000:  # instalaciones grandes
            base_potencial += 0.03  # +3%
            
        if self.consumo_anual > 500000:  # alto consumo
            base_potencial += 0.04  # +4%
            
        return min(base_potencial, 0.35)  # máximo 35%

    def calcular_distribucion_consumo(self):
        """Calcula la distribución estimada del consumo energético"""
        distribucion = {
            'Climatización': 35,
            'Iluminación': 20,
            'Equipos': 15,
            'Refrigeración': 15,
            'Otros': 15
        }
        
        # Ajustar según el sector
        if self.sector == 'industrial':
            distribucion = {
                'Maquinaria': 45,
                'Climatización': 20,
                'Iluminación': 15,
                'Refrigeración': 10,
                'Otros': 10
            }
        elif self.sector == 'alimentacion':
            distribucion = {
                'Refrigeración': 40,
                'Procesamiento': 30,
                'Climatización': 15,
                'Iluminación': 10,
                'Otros': 5
            }
        elif self.sector == 'comercial':
            distribucion = {
                'Climatización': 40,
                'Iluminación': 30,
                'Refrigeración': 15,
                'Equipos': 10,
                'Otros': 5
            }
        
        return distribucion

class Recomendacion(Base):
    __tablename__ = "recomendaciones"

    id = Column(Integer, primary_key=True, index=True)
    auditoria_basica_id = Column(Integer, ForeignKey("auditorias_basicas.id"), nullable=True)
    auditoria_agro_id = Column(Integer, ForeignKey("auditorias_agro.id"), nullable=True)
    categoria = Column(String(50), nullable=False)  # Iluminación, HVAC, etc.
    titulo = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    ahorro_estimado = Column(Float)  # Porcentaje de ahorro estimado
    costo_implementacion = Column(String(20))  # Bajo, Medio, Alto
    periodo_retorno = Column(Float)  # en meses
    prioridad = Column(Integer)  # 1 (alta) a 5 (baja)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    auditoria_basica = relationship("AuditoriaBasica", back_populates="recomendaciones")
    auditoria_agro = relationship("AuditoriaAgro", back_populates="recomendaciones")

    def __init__(self, **kwargs):
        # Asegurarse de que solo uno de los IDs de auditoría esté presente
        if 'auditoria_id' in kwargs:
            if kwargs.get('tipo_auditoria') == 'agro':
                kwargs['auditoria_agro_id'] = kwargs.pop('auditoria_id')
            else:
                kwargs['auditoria_basica_id'] = kwargs.pop('auditoria_id')
            kwargs.pop('tipo_auditoria', None)
        super().__init__(**kwargs)

class AuditoriaAgro(Base):
    __tablename__ = "auditorias_agro"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nombre_proyecto = Column(String(100), nullable=False)
    ubicacion = Column(String(100), nullable=False)
    area_total = Column(Float, nullable=False)  # en hectáreas
    tipo_cultivo = Column(String(50), nullable=False)
    produccion_anual = Column(Float, nullable=False)
    unidad_produccion = Column(String(20), nullable=False)
    
    # Consumos energéticos
    consumo_electrico = Column(Float, nullable=False)  # kWh/año
    consumo_combustible = Column(Float, nullable=False)  # litros/año
    consumo_agua = Column(Float, nullable=False)  # m³/año
    
    # Consumos por etapa
    consumo_campo = Column(Float)  # kWh/año
    consumo_planta = Column(Float)  # kWh/año
    consumo_plantel = Column(Float)  # kWh/año
    consumo_faenamiento = Column(Float)  # kWh/año
    consumo_proceso = Column(Float)  # kWh/año
    consumo_distribucion = Column(Float)  # kWh/año
    
    # Equipamiento y sistemas
    equipos = Column(JSON)  # Diccionario con cantidades de equipos
    sistemas_riego = Column(JSON)  # Información del sistema de riego
    
    # Características adicionales
    tiene_certificacion = Column(Boolean, default=False, server_default='false')
    tiene_mantenimiento = Column(Boolean, default=False, server_default='false')
    tiene_automatizacion = Column(Boolean, default=False, server_default='false')
    observaciones = Column(Text)
    
    # Metadatos
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Campos calculados
    consumo_total = Column(Float)  # kWh/año
    kpi_por_produccion = Column(Float)  # kWh/unidad de producción
    kpi_por_area = Column(Float)  # kWh/hectárea
    distribucion_consumo = Column(JSON)  # Distribución del consumo por etapa
    potencial_ahorro = Column(Float)  # Porcentaje de ahorro potencial
    puntuacion_eficiencia = Column(Float)  # Puntaje de 0 a 100
    comparacion_benchmark = Column(JSON)  # Comparación con benchmark del sector
    huella_carbono = Column(Float)  # kgCO2e/año
    eficiencia_riego = Column(Float)  # m³/hectárea
    costo_energia_por_produccion = Column(Float)  # $/unidad de producción

    # Relaciones
    usuario = relationship("User", back_populates="auditorias_agro")
    recomendaciones = relationship("Recomendacion", back_populates="auditoria_agro")

    def calcular_consumo_total(self):
        """Calcula el consumo energético total en kWh/año"""
        # Convertir consumo de combustible a kWh (factor aproximado: 10 kWh/litro)
        consumo_combustible_kwh = self.consumo_combustible * 10
        
        consumos = [
            self.consumo_electrico,
            consumo_combustible_kwh,
            self.consumo_campo or 0,
            self.consumo_planta or 0,
            self.consumo_plantel or 0,
            self.consumo_faenamiento or 0,
            self.consumo_proceso or 0,
            self.consumo_distribucion or 0
        ]
        return sum(consumos)

    def calcular_kpi_produccion(self):
        """Calcula el KPI de consumo por unidad de producción"""
        return self.calcular_consumo_total() / self.produccion_anual if self.produccion_anual > 0 else 0

    def calcular_kpi_area(self):
        """Calcula el KPI de consumo por hectárea"""
        return self.calcular_consumo_total() / self.area_total if self.area_total > 0 else 0

    def calcular_distribucion_consumo(self):
        """Calcula la distribución del consumo por etapa"""
        consumo_total = self.calcular_consumo_total()
        if consumo_total == 0:
            return {}
        
        etapas = {
            'Campo': self.consumo_campo or 0,
            'Planta': self.consumo_planta or 0,
            'Plantel': self.consumo_plantel or 0,
            'Faenamiento': self.consumo_faenamiento or 0,
            'Proceso': self.consumo_proceso or 0,
            'Distribución': self.consumo_distribucion or 0
        }
        
        return {etapa: (consumo / consumo_total) * 100 
                for etapa, consumo in etapas.items() 
                if consumo > 0}

    def calcular_potencial_ahorro(self):
        """Calcula el potencial de ahorro basado en múltiples factores"""
        base_potencial = 0.15  # 15% base
        
        if not self.tiene_certificacion:
            base_potencial += 0.05  # +5%
        
        if not self.tiene_mantenimiento:
            base_potencial += 0.07  # +7%
        
        if not self.tiene_automatizacion:
            base_potencial += 0.05  # +5%
        
        # Ajuste por tamaño
        if self.area_total > 100:  # grandes extensiones
            base_potencial += 0.03  # +3%
        
        # Ajuste por consumo
        if self.calcular_consumo_total() > 500000:  # alto consumo
            base_potencial += 0.05  # +5%
        
        return min(base_potencial, 0.40)  # máximo 40%

    def calcular_puntuacion_eficiencia(self):
        """Calcula la puntuación de eficiencia (0-100)"""
        puntuacion = 60  # Base
        
        # Factores positivos
        if self.tiene_certificacion:
            puntuacion += 10
        if self.tiene_mantenimiento:
            puntuacion += 10
        if self.tiene_automatizacion:
            puntuacion += 10
        
        # Eficiencia de riego
        eficiencia_riego = self.calcular_eficiencia_riego()
        if eficiencia_riego < 8:  # m³/hectárea
            puntuacion += 5
        
        # KPIs
        if self.calcular_kpi_area() < self.get_benchmark_sector()["consumo_promedio_sector"]:
            puntuacion += 5
        
        return min(puntuacion, 100)

    def calcular_huella_carbono(self):
        """Calcula la huella de carbono en kgCO2e/año"""
        # Factores de emisión aproximados
        factor_electricidad = 0.4  # kgCO2e/kWh
        factor_combustible = 2.7  # kgCO2e/litro
        
        emisiones_electricidad = self.consumo_electrico * factor_electricidad
        emisiones_combustible = self.consumo_combustible * factor_combustible
        
        return emisiones_electricidad + emisiones_combustible

    def calcular_eficiencia_riego(self):
        """Calcula la eficiencia del sistema de riego"""
        return self.consumo_agua / self.area_total if self.area_total > 0 else 0

    def calcular_costo_energia_por_produccion(self):
        """Calcula el costo energético por unidad de producción"""
        # Costos aproximados
        costo_kwh = 0.12  # $/kWh
        costo_combustible = 1.2  # $/litro
        
        costo_total = (self.consumo_electrico * costo_kwh) + (self.consumo_combustible * costo_combustible)
        return costo_total / self.produccion_anual if self.produccion_anual > 0 else 0

    def get_benchmark_sector(self):
        """Obtiene los valores de referencia del sector"""
        # Valores de referencia por tipo de cultivo
        benchmarks = {
            "cereales": {"consumo_promedio_sector": 2500, "eficiencia_riego": 6.5},
            "hortalizas": {"consumo_promedio_sector": 3500, "eficiencia_riego": 7.5},
            "frutales": {"consumo_promedio_sector": 4000, "eficiencia_riego": 8.0},
            "otros": {"consumo_promedio_sector": 3000, "eficiencia_riego": 7.0}
        }
        
        benchmark = benchmarks.get(self.tipo_cultivo.lower(), benchmarks["otros"])
        consumo_actual = self.calcular_kpi_area()
        
        return {
            "consumo_promedio_sector": benchmark["consumo_promedio_sector"],
            "eficiencia_riego_referencia": benchmark["eficiencia_riego"],
            "diferencia_porcentual": ((consumo_actual - benchmark["consumo_promedio_sector"]) 
                                    / benchmark["consumo_promedio_sector"]) * 100
        }

# Tabla de relación entre equipos y procesos
equipment_process = Table(
    'equipment_process',
    Base.metadata,
    Column('equipment_id', Integer, ForeignKey('agro_equipment.id'), primary_key=True),
    Column('process_id', Integer, ForeignKey('agro_process.id'), primary_key=True)
)

# Tabla de relación entre procesos y productos
proceso_producto = Table(
    'proceso_producto',
    Base.metadata,
    Column('id', Integer, primary_key=True),
    Column('proceso_id', Integer, ForeignKey('agro_process.id'), nullable=False),
    Column('producto_id', Integer, ForeignKey('agro_industry_type.id'), nullable=False),
    Column('consumo_referencia', Float),
    Column('unidad_consumo', String(50)),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    UniqueConstraint('proceso_id', 'producto_id', name='uq_proceso_producto')
)

# Tabla para almacenar consumos por fuente de energía
consumo_por_fuente = Table(
    'consumo_por_fuente',
    Base.metadata,
    Column('id', Integer, primary_key=True),
    Column('auditoria_id', Integer, ForeignKey('auditorias_agro.id'), nullable=False),
    Column('equipo_id', Integer, ForeignKey('agro_equipment.id'), nullable=False),
    Column('fuente_energia', String(50), nullable=False),
    Column('consumo', Float, nullable=False),
    Column('unidad', String(20), nullable=False),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
    UniqueConstraint('auditoria_id', 'equipo_id', 'fuente_energia', name='uq_consumo_fuente')
)

class AgroIndustryType(Base):
    __tablename__ = "agro_industry_type"
    
    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String, nullable=False)
    subsector = Column(String, nullable=False)
    producto = Column(String, nullable=False)
    kpi1_unidad = Column(String)
    kpi2_unidad = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AgroEquipment(Base):
    __tablename__ = "agro_equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    sector = Column(String, nullable=False)
    equipo = Column(String, nullable=False)
    fuentes_energia = Column(JSON, nullable=False)  # Lista de fuentes de energía posibles
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    procesos = relationship("AgroProcess", secondary=equipment_process, back_populates="equipos")
    consumos = relationship("AuditoriaAgro", secondary=consumo_por_fuente, backref="equipos_con_consumo")

class AgroProcess(Base):
    __tablename__ = "agro_process"
    
    id = Column(Integer, primary_key=True, index=True)
    etapa = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    equipos = relationship("AgroEquipment", secondary=equipment_process, back_populates="procesos")
    productos = relationship("AgroIndustryType", secondary=proceso_producto, backref="procesos")

class AgroEquipmentCategory(Base):
    __tablename__ = "agro_equipment_category"
    
    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String, nullable=False)
    equipo_especifico = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AgroEtapaSubsector(Base):
    __tablename__ = "agro_etapa_subsector"
    
    id = Column(Integer, primary_key=True, index=True)
    etapa = Column(String(100), nullable=False)
    subsector = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Modelos para el Panel de Control

class SectorIndustrial(Base):
    __tablename__ = "sectores_industriales"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True)
    descripcion = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    benchmarks = relationship("Benchmark", back_populates="sector")

class Benchmark(Base):
    __tablename__ = "benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    sector_id = Column(Integer, ForeignKey("sectores_industriales.id"))
    consumo_promedio = Column(Float)
    consumo_optimo = Column(Float)
    unidad_medida = Column(String)
    año = Column(Integer)
    fuente = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    sector = relationship("SectorIndustrial", back_populates="benchmarks")

class TipoEquipo(Base):
    __tablename__ = "tipos_equipos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True)
    categoria = Column(String)
    descripcion = Column(String)
    potencia_tipica = Column(Float)
    unidad_potencia = Column(String)
    eficiencia_tipica = Column(Float)
    vida_util = Column(Integer)  # en años
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PlantillaRecomendacion(Base):
    __tablename__ = "plantillas_recomendaciones"

    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String, index=True)
    titulo = Column(String)
    descripcion = Column(String)
    ahorro_estimado_min = Column(Float)
    ahorro_estimado_max = Column(Float)
    costo_implementacion = Column(String)  # Bajo, Medio, Alto
    periodo_retorno_tipico = Column(Float)  # en meses
    prioridad = Column(Integer)  # 1-5
    condiciones_aplicacion = Column(JSON)  # Condiciones para aplicar esta recomendación
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ParametrosSistema(Base):
    __tablename__ = "parametros_sistema"

    id = Column(Integer, primary_key=True, index=True)
    categoria = Column(String, index=True)
    nombre = Column(String, unique=True)
    valor = Column(JSON)  # Almacena el valor en formato JSON para flexibilidad
    descripcion = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DiagnosticoFeria(Base):
    __tablename__ = "diagnosticos_feria"
    
    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    access_code = Column(String(8), unique=True, index=True)
    
    # Datos de Contacto (Etapa 1)
    contact_info = Column(JSON, nullable=False)

    # Estado del diagnóstico
    estado = Column(String(50), default='CONTACTO_INICIADO', nullable=False)

    # Datos del Diagnóstico (Etapa 2 - pueden ser NULL inicialmente)
    background = Column(JSON, nullable=True)
    production = Column(JSON, nullable=True)
    equipment = Column(JSON, nullable=True)
    renewable = Column(JSON, nullable=True)
    volume = Column(JSON, nullable=True)
    meta_data = Column(JSON, nullable=True)
    
    # Resultados calculados (Etapa 2 - serán NULL inicialmente)
    intensidad_energetica = Column(Float, nullable=True)
    costo_energia_anual = Column(Float, nullable=True)
    potencial_ahorro = Column(Float, nullable=True)
    puntuacion_eficiencia = Column(Float, nullable=True)
    comparacion_sector = Column(JSON, nullable=True)
    
    # Recomendaciones generadas (Etapa 2 - serán NULL inicialmente)
    recomendaciones = Column(JSON, nullable=True)
    
    # URLs relacionadas (Etapa 2 - serán NULL inicialmente, o generadas al completar)
    pdf_url = Column(String, nullable=True)
    view_url = Column(String, nullable=True)

# Nuevos modelos para el sistema de preguntas autoadministrables

class AutodiagnosticoPregunta(Base):
    __tablename__ = "autodiagnostico_preguntas"
    
    id = Column(Integer, primary_key=True, index=True)
    numero_orden = Column(Integer, nullable=False, unique=True)  # Para mantener el orden
    pregunta = Column(Text, nullable=False)
    tipo_respuesta = Column(String(50), nullable=False)  # 'radio', 'checkbox', 'text', 'number', 'select'
    es_obligatoria = Column(Boolean, default=True)
    es_activa = Column(Boolean, default=True)  # Para habilitar/deshabilitar sin eliminar
    ayuda_texto = Column(Text, nullable=True)  # Texto de ayuda o descripción adicional
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    opciones = relationship("AutodiagnosticoOpcion", back_populates="pregunta", cascade="all, delete-orphan")

class AutodiagnosticoOpcion(Base):
    __tablename__ = "autodiagnostico_opciones"
    
    id = Column(Integer, primary_key=True, index=True)
    pregunta_id = Column(Integer, ForeignKey("autodiagnostico_preguntas.id"), nullable=False)
    texto_opcion = Column(String(200), nullable=False)
    valor = Column(String(100), nullable=False)  # Valor que se guardará al seleccionar esta opción
    es_por_defecto = Column(Boolean, default=False)  # Si es la opción por defecto
    es_especial = Column(Boolean, default=False)  # Para opciones como "No sé", "Otro"
    orden = Column(Integer, nullable=False)  # Orden de la opción dentro de la pregunta
    es_activa = Column(Boolean, default=True)
    tiene_sugerencia = Column(Boolean, default=False)  # Si esta opción tiene una sugerencia asociada
    sugerencia = Column(Text, nullable=True)  # Texto de la sugerencia/recomendación
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    pregunta = relationship("AutodiagnosticoPregunta", back_populates="opciones")

class AutodiagnosticoRespuesta(Base):
    __tablename__ = "autodiagnostico_respuestas"
    
    id = Column(String, primary_key=True, index=True)  # UUID único para cada sesión
    session_id = Column(String(100), nullable=False, index=True)  # ID de sesión único
    pregunta_id = Column(Integer, ForeignKey("autodiagnostico_preguntas.id"), nullable=False)
    respuesta_texto = Column(Text, nullable=True)  # Para respuestas de texto libre
    respuesta_numero = Column(Float, nullable=True)  # Para respuestas numéricas
    opciones_seleccionadas = Column(JSON, nullable=True)  # Para respuestas múltiples (checkbox)
    opcion_seleccionada = Column(String(100), nullable=True)  # Para respuesta única (radio/select)
    archivo_adjunto = Column(String, nullable=True)  # URL del archivo si aplica
    
    # Metadatos
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relación con pregunta
    pregunta = relationship("AutodiagnosticoPregunta")


# ========================================
# NUEVOS MODELOS: FORMULARIOS POR INDUSTRIA
# ========================================

class CategoriaIndustria(Base):
    """Modelo para categorías de industria (Industrial, Agropecuario, etc.)"""
    __tablename__ = "categorias_industria"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, index=True)  # "Industrial", "Agropecuario", etc.
    descripcion = Column(Text, nullable=True)
    icono = Column(String(50), nullable=True)  # Emoji o clase CSS
    color = Column(String(7), nullable=True)  # Color hex para UI (#FFFFFF)
    activa = Column(Boolean, default=True, server_default='true')
    orden = Column(Integer, nullable=False, default=0)  # Para ordenamiento
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relaciones
    formularios = relationship("FormularioIndustria", back_populates="categoria")


class FormularioIndustria(Base):
    """Modelo para formularios específicos por categoría de industria"""
    __tablename__ = "formularios_industria"

    id = Column(Integer, primary_key=True, index=True)
    categoria_id = Column(Integer, ForeignKey("categorias_industria.id"), nullable=False)
    nombre = Column(String(200), nullable=False)  # "Diagnóstico Industrial Básico"
    descripcion = Column(Text, nullable=True)
    activo = Column(Boolean, default=True, server_default='true')
    orden = Column(Integer, nullable=False, default=0)
    tiempo_estimado = Column(Integer, nullable=True)  # minutos estimados
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relaciones
    categoria = relationship("CategoriaIndustria", back_populates="formularios")
    preguntas = relationship("PreguntaFormulario", back_populates="formulario")


class PreguntaFormulario(Base):
    """Modelo para preguntas con soporte condicional y campos 'Otro'"""
    __tablename__ = "preguntas_formulario"

    id = Column(Integer, primary_key=True, index=True)
    formulario_id = Column(Integer, ForeignKey("formularios_industria.id"), nullable=False)
    texto = Column(Text, nullable=False)
    subtitulo = Column(Text, nullable=True)  # Texto explicativo
    tipo = Column(String(50), nullable=False)  # 'radio', 'checkbox', 'text', 'number', 'select', 'ordering'
    opciones = Column(JSON, nullable=True)  # Array de opciones
    tiene_opcion_otro = Column(Boolean, default=False, server_default='false')  # ¿Incluye "Otro"?
    placeholder_otro = Column(String(200), nullable=True)  # Placeholder para campo "Otro"
    orden = Column(Integer, nullable=False, default=0)
    requerida = Column(Boolean, default=True, server_default='true')
    activa = Column(Boolean, default=True, server_default='true')
    
    # CAMPOS CONDICIONALES:
    pregunta_padre_id = Column(Integer, ForeignKey("preguntas_formulario.id"), nullable=True)
    condicion_valor = Column(JSON, nullable=True)  # {"valor": "si", "operador": "=", "campo": "valor"}
    condicion_operador = Column(String(20), nullable=True)  # "=", "!=", "includes", "not_includes"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relaciones
    formulario = relationship("FormularioIndustria", back_populates="preguntas")
    pregunta_padre = relationship("PreguntaFormulario", remote_side=[id])
    preguntas_hijas = relationship("PreguntaFormulario", remote_side=[pregunta_padre_id])
    respuestas = relationship("RespuestaFormulario", back_populates="pregunta")


class RespuestaFormulario(Base):
    """Modelo para respuestas de usuarios con soporte para campos 'Otro'"""
    __tablename__ = "respuestas_formulario"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=False, index=True)  # UUID de sesión
    pregunta_id = Column(Integer, ForeignKey("preguntas_formulario.id"), nullable=False)
    valor_respuesta = Column(JSON, nullable=True)  # Flexible para cualquier tipo
    valor_otro = Column(Text, nullable=True)  # Texto del campo "Otro"
    ip_address = Column(String(45), nullable=True)  # IPv4/IPv6
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    pregunta = relationship("PreguntaFormulario", back_populates="respuestas") 