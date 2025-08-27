-- Crear tabla de relación entre equipos específicos y procesos
CREATE TABLE IF NOT EXISTS agro_equipment_process_detail (
    id SERIAL PRIMARY KEY,
    equipo_especifico VARCHAR(100) NOT NULL,
    proceso VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar las relaciones entre equipos específicos y procesos
INSERT INTO agro_equipment_process_detail (equipo_especifico, proceso) VALUES
-- Maquinaria agrícola
('Tractor', 'Preparación del terreno'),
('Fertilizadoras', 'Preparación del terreno'),
('Podadoras', 'Manejo de cultivos'),
('Cosechadora', 'Cosecha'),

-- Sistemas de riego
('Goteros', 'Manejo de cultivos'),
('Aspersores', 'Manejo de cultivos'),
('Microaspersores', 'Manejo de cultivos'),
('Nebulizadores', 'Manejo de cultivos'),
('Pivotes de riego', 'Manejo de cultivos'),
('Filtros (riego)', 'Manejo de cultivos'),
('Bomba de impulsión (riego)', 'Manejo de cultivos'),
('Motobomba (riego)', 'Manejo de cultivos'),

-- Motores y compresores (Various)
('Motores', '(Various)'),
('Compresores', '(Various)'),
('DistribuciónBombas', '(Various)'),

-- Generación de calor
('Maquinaria agrícola (Generación de calor)', 'Preparación del terreno'),
('Maquinaria agrícola (Generación de calor)', 'Manejo de cultivos'),
('Maquinaria agrícola (Generación de calor)', 'Cosecha'),

-- Transporte
('Grúa horquilla', 'Labores de traslado'),
('Grúa horquilla', 'Transporte'),
('Grúa horquilla', 'Distribución'),
('Grúa horquilla', 'Almacenamiento'); 