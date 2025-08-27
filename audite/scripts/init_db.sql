-- Script de inicialización para PostgreSQL
-- Este script se ejecuta automáticamente cuando se crea el contenedor

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Crear esquemas si es necesario
-- CREATE SCHEMA IF NOT EXISTS audite;

-- Configurar timezone
SET timezone = 'UTC';

-- Mensaje de confirmación
SELECT 'Base de datos PostgreSQL inicializada correctamente para AuditE' as mensaje; 