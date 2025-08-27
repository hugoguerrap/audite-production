-- Limpiar datos existentes
DELETE FROM agro_etapa_subsector;

-- Insertar las relaciones entre etapas y subsectores
INSERT INTO agro_etapa_subsector (etapa, subsector) VALUES
('Campo', 'Agroindustria Hortofrutícola'),
('Planta de procesamiento', 'Agroindustria Hortofrutícola'),
('Plantel de animales', 'Agroindustria Animal'),
('Faenamiento', 'Agroindustria Animal'),
('Proceso', 'Agroindustria Animal'),
('Distribución', 'Agroindustria Animal'); 