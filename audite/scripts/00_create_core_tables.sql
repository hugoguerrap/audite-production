-- Crear tabla de tipos de industria agrícola
CREATE TABLE IF NOT EXISTS agro_industry_type (
    id SERIAL PRIMARY KEY,
    sector VARCHAR(100) NOT NULL,
    subsector VARCHAR(100) NOT NULL,
    producto VARCHAR(100) NOT NULL,
    kpi1_unidad VARCHAR(50),
    kpi2_unidad VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de equipos agrícolas
CREATE TABLE IF NOT EXISTS agro_equipment (
    id SERIAL PRIMARY KEY,
    sector VARCHAR(100) NOT NULL,
    equipo VARCHAR(100) NOT NULL,
    fuentes_energia JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de procesos agrícolas
CREATE TABLE IF NOT EXISTS agro_process (
    id SERIAL PRIMARY KEY,
    etapa VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de categorías de equipos
CREATE TABLE IF NOT EXISTS agro_equipment_category (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    equipo_especifico VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de relación entre equipos y procesos
CREATE TABLE IF NOT EXISTS equipment_process (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES agro_equipment(id),
    process_id INTEGER REFERENCES agro_process(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para relación entre procesos y productos
CREATE TABLE IF NOT EXISTS proceso_producto (
    id SERIAL PRIMARY KEY,
    proceso_id INTEGER REFERENCES agro_process(id),
    producto_id INTEGER REFERENCES agro_industry_type(id),
    consumo_referencia NUMERIC,
    unidad_consumo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para consumo por fuente de energía
CREATE TABLE IF NOT EXISTS consumo_por_fuente (
    id SERIAL PRIMARY KEY,
    auditoria_id INTEGER,  -- Referencias a una tabla de auditorías que debería existir
    equipo_id INTEGER REFERENCES agro_equipment(id),
    fuente_energia VARCHAR(100),
    consumo NUMERIC,
    unidad VARCHAR(50),
    fecha DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE, -- Asegurarse que el email sea único
    hashed_password VARCHAR NOT NULL,
    nombre VARCHAR(100),
    empresa VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true -- Por defecto activo
);

-- Crear tabla de Auditorías Básicas
CREATE TABLE IF NOT EXISTS auditorias_basicas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES users(id),
    nombre_empresa VARCHAR(100) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    tamano_instalacion FLOAT NOT NULL,
    num_empleados INTEGER NOT NULL,
    consumo_anual FLOAT NOT NULL,
    factura_mensual FLOAT NOT NULL,
    tiene_auditoria_previa BOOLEAN DEFAULT false,
    fuentes_energia JSON NOT NULL,
    datos_equipos JSON,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address VARCHAR(45),
    is_complete BOOLEAN DEFAULT false,
    equipment_age VARCHAR(50),
    renewable_energy BOOLEAN DEFAULT false,
    energy_priorities VARCHAR(200),
    savings_target FLOAT,
    implementation_budget VARCHAR(50),
    intensidad_energetica FLOAT,
    consumo_por_empleado FLOAT,
    costo_por_empleado FLOAT,
    potencial_ahorro FLOAT,
    puntuacion_eficiencia FLOAT,
    distribucion_consumo JSON,
    comparacion_benchmark JSON
);

-- Crear tabla de Auditorías Agro
CREATE TABLE IF NOT EXISTS auditorias_agro (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES users(id),
    nombre_proyecto VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100) NOT NULL,
    area_total FLOAT NOT NULL,
    tipo_cultivo VARCHAR(50) NOT NULL,
    produccion_anual FLOAT NOT NULL,
    unidad_produccion VARCHAR(20) NOT NULL,
    consumo_electrico FLOAT NOT NULL,
    consumo_combustible FLOAT NOT NULL,
    consumo_agua FLOAT NOT NULL,
    consumo_campo FLOAT,
    consumo_planta FLOAT,
    consumo_plantel FLOAT,
    consumo_faenamiento FLOAT,
    consumo_proceso FLOAT,
    consumo_distribucion FLOAT,
    equipos JSON,
    sistemas_riego JSON,
    tiene_certificacion BOOLEAN DEFAULT false,
    tiene_mantenimiento BOOLEAN DEFAULT false,
    tiene_automatizacion BOOLEAN DEFAULT false,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    consumo_total FLOAT,
    kpi_por_produccion FLOAT,
    kpi_por_area FLOAT,
    distribucion_consumo JSON,
    potencial_ahorro FLOAT,
    puntuacion_eficiencia FLOAT,
    comparacion_benchmark JSON,
    huella_carbono FLOAT,
    eficiencia_riego FLOAT,
    costo_energia_por_produccion FLOAT
);

-- Crear tabla de Recomendaciones
CREATE TABLE IF NOT EXISTS recomendaciones (
    id SERIAL PRIMARY KEY,
    auditoria_basica_id INTEGER REFERENCES auditorias_basicas(id),
    auditoria_agro_id INTEGER REFERENCES auditorias_agro(id),
    categoria VARCHAR(50) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    ahorro_estimado FLOAT,
    costo_implementacion VARCHAR(20),
    periodo_retorno FLOAT,
    prioridad INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_auditoria_id CHECK (auditoria_basica_id IS NOT NULL OR auditoria_agro_id IS NOT NULL)
);

-- Crear tabla de Etapa-Subsector (Agro)
CREATE TABLE IF NOT EXISTS agro_etapa_subsector (
    id SERIAL PRIMARY KEY,
    etapa VARCHAR(100) NOT NULL,
    subsector VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de Sectores Industriales (Admin)
CREATE TABLE IF NOT EXISTS sectores_industriales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR UNIQUE NOT NULL,
    descripcion VARCHAR,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_sectores_industriales_nombre ON sectores_industriales (nombre);

-- Crear tabla de Benchmarks (Admin)
CREATE TABLE IF NOT EXISTS benchmarks (
    id SERIAL PRIMARY KEY,
    sector_id INTEGER REFERENCES sectores_industriales(id),
    consumo_promedio FLOAT,
    consumo_optimo FLOAT,
    unidad_medida VARCHAR,
    año INTEGER,
    fuente VARCHAR,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Crear tabla de Tipos de Equipos (Admin)
CREATE TABLE IF NOT EXISTS tipos_equipos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR UNIQUE NOT NULL,
    categoria VARCHAR,
    descripcion VARCHAR,
    potencia_tipica FLOAT,
    unidad_potencia VARCHAR,
    eficiencia_tipica FLOAT,
    vida_util INTEGER,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_tipos_equipos_nombre ON tipos_equipos (nombre);

-- Crear tabla de Plantillas de Recomendaciones (Admin)
CREATE TABLE IF NOT EXISTS plantillas_recomendaciones (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR,
    titulo VARCHAR,
    descripcion VARCHAR,
    ahorro_estimado_min FLOAT,
    ahorro_estimado_max FLOAT,
    costo_implementacion VARCHAR,
    periodo_retorno_tipico FLOAT,
    prioridad INTEGER,
    condiciones_aplicacion JSON,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_plantillas_recomendaciones_categoria ON plantillas_recomendaciones (categoria);

-- Crear tabla de Parámetros del Sistema (Admin)
CREATE TABLE IF NOT EXISTS parametros_sistema (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR,
    nombre VARCHAR UNIQUE NOT NULL,
    valor JSON,
    descripcion VARCHAR,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_parametros_sistema_categoria ON parametros_sistema (categoria);

-- Definición para la tabla diagnosticos_feria (Flujo de Dos Etapas)
CREATE TABLE IF NOT EXISTS diagnosticos_feria (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    access_code VARCHAR(8) UNIQUE, -- Se genera en Etapa 1, debe ser único
    
    contact_info JSONB NOT NULL, -- Capturado en Etapa 1

    estado VARCHAR(50) NOT NULL DEFAULT 'CONTACTO_INICIADO', -- Nuevo campo de estado

    -- Campos llenados en Etapa 2 (pueden ser NULL inicialmente)
    background JSONB,
    production JSONB,
    equipment JSONB,
    renewable JSONB,
    volume JSONB,
    meta_data JSONB,
    
    intensidad_energetica FLOAT,
    costo_energia_anual FLOAT,
    potencial_ahorro FLOAT,
    puntuacion_eficiencia FLOAT,
    comparacion_sector JSONB,
    recomendaciones JSONB,
    
    pdf_url TEXT,
    view_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE -- Actualizar manualmente o con trigger/SQLAlchemy onupdate
);

CREATE INDEX IF NOT EXISTS ix_diagnosticos_feria_id ON diagnosticos_feria (id);
-- El constraint UNIQUE en access_code ya crea un índice para él. 