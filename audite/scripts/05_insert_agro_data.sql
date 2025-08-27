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

-- Insertar etapas y procesos
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
('Planta de procesamiento', 'Distribución'),
-- Plantel de animales
('Plantel de animales', 'Recepción de crías'),
('Plantel de animales', 'Plantel de animales'),
('Plantel de animales', 'Reproducción de animales'),
('Plantel de animales', 'Cría de animales para carne'),
('Plantel de animales', 'Cría de animales otros productos'),
-- Faenamiento
('Faenamiento', 'Operación de sacrificio y faenamiento'),
('Faenamiento', 'Eviscerado carnes rojas'),
('Faenamiento', 'Trozado y deshuesado'),
('Faenamiento', 'Porcionado y obtención de cortes comerciales'),
('Faenamiento', 'Corte de extremidades y cabeza'),
('Faenamiento', 'Desollado o escaldado y depilado'),
('Faenamiento', 'Escalado, desplume y eviscerado carnes blancas'),
('Faenamiento', 'Lavado'),
-- Proceso
('Proceso', 'AlmacenamientoDespiece y/o deshuesado'),
('Proceso', 'Selección y envasado'),
('Proceso', 'Enfriamiento Refrigeración'),
('Proceso', 'Almacenamiento Refrigeración'),
('Proceso', 'Congelado'),
('Proceso', 'Ordeña y transporte'),
('Proceso', 'Recolección y transporte'),
('Proceso', 'Clasificación y empaque'),
('Proceso', 'Selección, pesaje y envasado de cortes comerciales'),
('Proceso', 'Envasado de subproductos'),
-- Distribución
('Distribución', 'Transporte'),
('Distribución', 'Distribución');

-- Insertar equipos específicos
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
('Distribución', 'DistribuciónBombas'),
('Generación de calor', 'Maquinaria agrícola (Generación de calor)'),
('Transporte', 'Grúa horquilla');

-- Insertar relaciones entre equipos y procesos
INSERT INTO equipment_process (equipment_id, process_id)
SELECT e.id, p.id
FROM agro_equipment e, agro_process p
WHERE (e.equipo = 'Maquinaria agrícola' AND p.nombre IN ('Preparación del terreno', 'Manejo de cultivos', 'Cosecha'))
   OR (e.equipo = 'Sistemas de riego (bombas)' AND p.nombre = 'Manejo de cultivos')
   OR (e.equipo = 'Equipos de frío (compresores, chillers)' AND p.nombre IN ('Almacenamiento en frío', 'Almacenamiento congelado', 'Congelado'))
   OR (e.equipo = 'Grúa horquilla' AND p.nombre IN ('Labores de traslado', 'Transporte', 'Distribución')); 