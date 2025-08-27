-- Limpiar datos existentes
TRUNCATE TABLE agro_industry_type CASCADE;
TRUNCATE TABLE agro_equipment CASCADE;
TRUNCATE TABLE agro_process CASCADE;
TRUNCATE TABLE agro_equipment_category CASCADE;
TRUNCATE TABLE agro_etapa_subsector CASCADE;
TRUNCATE TABLE equipment_process CASCADE;
TRUNCATE TABLE proceso_producto CASCADE;
TRUNCATE TABLE consumo_por_fuente CASCADE;

-- Insertar tipos de industria agro
INSERT INTO agro_industry_type (sector, subsector, producto, kpi1_unidad, kpi2_unidad) VALUES
('Agroindustria', 'Agroindustria Hortofrutícola', 'Productos frescos', 'kWh/caja', 'kWh/Ton'),
('Agroindustria', 'Agroindustria Hortofrutícola', 'Harina y aceites', 'kWh/lt', 'kWh/Ton'),
('Agroindustria', 'Agroindustria Hortofrutícola', 'Frutas y verduras congeladas', 'kWh/caja', 'kWh/Ton'),
('Agroindustria', 'Agroindustria Hortofrutícola', 'Frutas y verduras deshidratadas', 'kWh/caja', 'kWh/Ton'),
('Agroindustria', 'Agroindustria Animal', 'Productos cárnicos', 'kWh/caja', 'kWh/Ton'),
('Agroindustria', 'Agroindustria Animal', 'Subproductos (cárnicos)', 'kWh/Ton', NULL),
('Agroindustria', 'Agroindustria Animal', 'Leche', 'kWh/lt', NULL),
('Agroindustria', 'Agroindustria Animal', 'Huevos', 'kWh/cajas', 'Wh/unidad'),
('Agroindustria', 'Agroindustria Animal', 'Cortes comerciales (cárnicos)', 'kWh/Ton', NULL);

-- Insertar equipos agro con fuentes de energía en formato JSON
INSERT INTO agro_equipment (sector, equipo, fuentes_energia) VALUES
('Agroindustria', 'Maquinaria agrícola', '["Combustible (diésel)", "Electricidad"]'::json),
('Agroindustria', 'Generación de calor', '["Combustible", "Electricidad", "Otros"]'::json),
('Agroindustria', 'Motores (bombas, compresores, etc.)', '["Electricidad"]'::json),
('Agroindustria', 'Grúa horquilla', '["Electricidad", "Neumática", "Combustible"]'::json),
('Agroindustria', 'Sistemas de riego (bombas)', '["Electricidad", "Motobomba (combustible)"]'::json),
('Agroindustria', 'Equipos de frío (compresores, chillers)', '["Electricidad"]'::json),
('Agroindustria', 'Calderas', '["Gas Licuado Petróleo (GLP)", "Gas Natural (GN)", "Biomasa", "Diésel"]'::json),
('Agroindustria', 'Sistemas de Iluminación', '["Electricidad"]'::json);

-- Insertar procesos
INSERT INTO agro_process (etapa, nombre) VALUES
-- Campo
('Campo', 'Preparación del terreno'),
('Campo', 'Manejo de cultivos'),
('Campo', 'Cosecha'),
-- Planta de procesamiento
('Planta de procesamiento', 'Recepción'),
('Planta de procesamiento', 'Acondicionamiento'),
('Planta de procesamiento', 'Molienda'),
('Planta de procesamiento', 'Prensado y/o centrifugado'),
('Planta de procesamiento', 'Neutralización y refinación'),
('Planta de procesamiento', 'Pelado o desgranado'),
('Planta de procesamiento', 'Cortado, trozado, deshuesado'),
('Planta de procesamiento', 'Escaldado'),
('Planta de procesamiento', 'Congelado'),
('Planta de procesamiento', 'Deshidratado'),
('Planta de procesamiento', 'Ventilación'),
('Planta de procesamiento', 'Pesaje, selección y clasificación'),
('Planta de procesamiento', 'Limpieza y/o lavado'),
('Planta de procesamiento', 'Sanitizado'),
('Planta de procesamiento', 'Secado, centrifugado'),
('Planta de procesamiento', 'Almacenamiento granel y/o empaque'),
('Planta de procesamiento', 'Clasificación y empaque de productos'),
('Planta de procesamiento', 'Almacenamiento en frío'),
('Planta de procesamiento', 'Almacenamiento congelado'),
('Planta de procesamiento', 'Labores de traslado'),
('Planta de procesamiento', 'Transporte'),
('Planta de procesamiento', 'Distribución');

-- Insertar categorías de equipos
INSERT INTO agro_equipment_category (categoria, equipo_especifico) VALUES
('Maquinaria agrícola', 'Tractor'),
('Maquinaria agrícola', 'Fertilizadoras'),
('Maquinaria agrícola', 'Podadoras'),
('Maquinaria agrícola', 'Cosechadora'),
('Sistemas de riego', 'Goteros'),
('Sistemas de riego', 'Aspersores'),
('Sistemas de riego', 'Microaspersores'),
('Sistemas de riego', 'Nebulizadores'),
('Sistemas de riego', 'Pivotes de riego'),
('Sistemas de riego', 'Filtros (riego)'),
('Sistemas de riego', 'Bomba de impulsión (riego)'),
('Sistemas de riego', 'Motobomba (riego)'),
('Motores y compresores', 'Motores'),
('Motores y compresores', 'Compresores'),
('Distribución', 'Bombas'),
('Generación de calor', 'Maquinaria agrícola (Generación de calor)'),
('Transporte', 'Grúa horquilla');

-- Insertar relaciones entre etapas y subsectores
INSERT INTO agro_etapa_subsector (etapa, subsector) VALUES
('Campo', 'Agroindustria Hortofrutícola'),
('Planta de procesamiento', 'Agroindustria Hortofrutícola'),
('Plantel de animales', 'Agroindustria Animal'),
('Faenamiento', 'Agroindustria Animal'),
('Proceso', 'Agroindustria Animal'),
('Distribución', 'Agroindustria Animal');

-- Insertar algunas relaciones proceso-producto con consumos de referencia
INSERT INTO proceso_producto (proceso_id, producto_id, consumo_referencia, unidad_consumo)
SELECT p.id, i.id, 
    CASE 
        WHEN p.etapa = 'Campo' THEN 100.0
        WHEN p.etapa = 'Planta de procesamiento' THEN 150.0
        ELSE 75.0
    END,
    'kWh/ton'
FROM agro_process p
CROSS JOIN agro_industry_type i
WHERE (p.etapa = 'Campo' AND i.subsector = 'Agroindustria Hortofrutícola')
   OR (p.etapa = 'Planta de procesamiento' AND i.producto IN ('Productos frescos', 'Frutas y verduras congeladas')); 