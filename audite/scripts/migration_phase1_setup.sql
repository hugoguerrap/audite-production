-- ============================================================================
-- FASE 1: PREPARACIÓN - ESTRUCTURA PARA MIGRACIÓN
-- ============================================================================
-- Script SQL para preparar la estructura base antes de migrar datos

-- 1. CREAR CATEGORÍA "GENERAL" PARA AUTODIAGNÓSTICO TRADICIONAL
-- ============================================================================

INSERT INTO categorias_industria (nombre, descripcion, icono, color, activa, orden, created_at, updated_at)
VALUES (
    'General',
    'Autodiagnóstico energético general aplicable a cualquier tipo de empresa',
    '⚡',
    '#3B82F6',
    true,
    0,
    NOW(),
    NOW()
) ON CONFLICT (nombre) DO NOTHING;

-- 2. CREAR FORMULARIO "AUTODIAGNÓSTICO BÁSICO"
-- ============================================================================

INSERT INTO formularios_industria (
    categoria_id, 
    nombre, 
    descripcion, 
    activo, 
    orden, 
    tiempo_estimado,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM categorias_industria WHERE nombre = 'General' LIMIT 1),
    'Autodiagnóstico Energético Básico',
    'Formulario de diagnóstico energético general migrado del sistema tradicional. Incluye preguntas fundamentales para evaluar el consumo y eficiencia energética de cualquier empresa.',
    true,
    0,
    15,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 3. VERIFICAR DATOS INSERTADOS
-- ============================================================================

-- Mostrar la categoría creada
SELECT 'CATEGORÍA CREADA:' as info, id, nombre, descripcion, icono, color
FROM categorias_industria 
WHERE nombre = 'General';

-- Mostrar el formulario creado
SELECT 'FORMULARIO CREADO:' as info, f.id, f.nombre, f.descripcion, c.nombre as categoria
FROM formularios_industria f
JOIN categorias_industria c ON f.categoria_id = c.id
WHERE f.nombre = 'Autodiagnóstico Energético Básico';

-- 4. PREPARAR TABLAS DE MAPEO TEMPORAL
-- ============================================================================

-- Tabla temporal para mapear IDs de preguntas durante migración
CREATE TABLE IF NOT EXISTS temp_pregunta_mapping (
    old_id INTEGER PRIMARY KEY,
    new_id INTEGER NOT NULL,
    old_numero_orden INTEGER,
    migrated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla temporal para almacenar estadísticas de migración
CREATE TABLE IF NOT EXISTS temp_migration_stats (
    entity_type VARCHAR(50),
    total_records INTEGER,
    migrated_records INTEGER,
    failed_records INTEGER,
    migration_start TIMESTAMP,
    migration_end TIMESTAMP,
    notes TEXT
);

-- Limpiar tablas temporales si existen datos previos
TRUNCATE TABLE temp_pregunta_mapping;
TRUNCATE TABLE temp_migration_stats;

-- Insertar registro inicial de estadísticas
INSERT INTO temp_migration_stats (entity_type, migration_start, notes)
VALUES ('migration_phase1', NOW(), 'Iniciando Fase 1 - Preparación de estructura');

COMMIT;