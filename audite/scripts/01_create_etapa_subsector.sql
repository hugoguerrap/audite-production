-- Crear tabla de relación entre etapas y subsectores
CREATE TABLE IF NOT EXISTS agro_etapa_subsector (
    id SERIAL PRIMARY KEY,
    etapa VARCHAR(100) NOT NULL,
    subsector VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar las relaciones entre etapas y subsectores
INSERT INTO agro_etapa_subsector (etapa, subsector) VALUES
('Campo', 'Agroindustria Hortofrutícola'),
('Planta de procesamiento', 'Agroindustria Hortofrutícola'),
('Plantel de animales', 'Agroindustria Animal'),
('Faenamiento', 'Agroindustria Animal'),
('Proceso', 'Agroindustria Animal'),
('Distribución', 'Agroindustria Animal'); 