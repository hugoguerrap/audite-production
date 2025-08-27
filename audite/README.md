# Audite API - Sistema de Auditorías Energéticas

## Descripción
Audite es una API robusta diseñada para realizar auditorías energéticas en diferentes sectores, con un enfoque especial en el sector agroindustrial. La API permite gestionar auditorías básicas y específicas del sector agrícola, calculando automáticamente KPIs, métricas de consumo y generando recomendaciones personalizadas.

## Características Principales

### 1. Gestión de Usuarios
- Registro de usuarios con información de empresa
- Autenticación mediante tokens JWT
- Gestión de perfiles y permisos

### 2. Auditorías Básicas
#### Datos Capturados:
- Información general de la empresa
- Tamaño de instalaciones
- Número de empleados
- Consumo energético anual
- Facturación mensual
- Fuentes de energía utilizadas
- Información detallada de equipos:
  * Iluminación (potencia y horas de uso)
  * Climatización (potencia y horas de uso)

#### Métricas Calculadas:
- Intensidad energética (kWh/m²)
- Consumo por empleado (kWh/empleado)
- Costo energético por empleado ($/empleado)
- Potencial de ahorro (%)
- Puntuación de eficiencia (0-100)
- Distribución del consumo por tipo de equipo
- Comparación con benchmarks del sector:
  * Consumo promedio del sector
  * Diferencia porcentual con el promedio

### 3. Auditorías Agroindustriales
#### Datos Capturados:
- Información del proyecto agrícola
- Área total en hectáreas
- Tipo de cultivo
- Producción anual
- Consumos energéticos:
  * Electricidad (kWh/año)
  * Combustible (litros/año)
  * Agua (m³/año)
- Equipamiento y sistemas de riego
- Certificaciones y automatización

#### Consumos por Etapa:
- Campo
- Planta
- Plantel
- Faenamiento
- Proceso
- Distribución

#### Métricas Calculadas:
- Consumo total (kWh/año)
- KPI por producción (kWh/unidad)
- KPI por área (kWh/hectárea)
- Distribución porcentual del consumo por etapa

### 4. Sistema de Recomendaciones
Las recomendaciones se generan automáticamente basadas en:
- Tipo de equipamiento
- Eficiencia de sistemas de riego
- Nivel de automatización
- Prácticas de mantenimiento
- Tamaño de la operación

Cada recomendación incluye:
- Categoría
- Título y descripción
- Ahorro estimado (%)
- Costo de implementación
- Período de retorno de inversión
- Nivel de prioridad (1-5)

### 5. Gestión de Datos Maestros
#### Tipos de Industria Agro:
- Sectores y subsectores
- Productos
- KPIs específicos por tipo

#### Equipamiento:
- Categorías de equipos
- Fuentes de energía compatibles
- Relaciones con procesos

#### Procesos:
- Etapas de producción
- Relaciones con productos
- Consumos de referencia

## Relaciones y Modelos de Datos

### Auditoría Agrícola
```
AuditoriaAgro
├── Usuario (FK)
├── Recomendaciones (1:N)
├── Equipos
│   └── Consumos por fuente (N:M)
└── Sistemas de riego
```

### Equipamiento y Procesos
```
AgroEquipment
├── Procesos (N:M)
└── Consumos (N:M)

AgroProcess
├── Productos (N:M)
└── Equipos (N:M)
```

## Cálculos y Fórmulas

### 1. Consumo Total (Auditoría Básica)
```python
# Cálculo de intensidad energética
intensidad_energetica = consumo_anual / tamano_instalacion

# Cálculo de consumo por empleado
consumo_por_empleado = consumo_anual / num_empleados

# Cálculo de costo por empleado
costo_por_empleado = (factura_mensual * 12) / num_empleados

# Cálculo de distribución de consumo
consumo_iluminacion = datos_equipos['iluminacion_potencia'] * datos_equipos['iluminacion_horas_uso']
consumo_climatizacion = datos_equipos['climatizacion_potencia'] * datos_equipos['climatizacion_horas_uso']
consumo_total_equipos = consumo_iluminacion + consumo_climatizacion

distribucion_consumo = {
    'Iluminación': (consumo_iluminacion / consumo_total_equipos) * 100,
    'Climatización': (consumo_climatizacion / consumo_total_equipos) * 100
}
```

### 2. Consumo Total (Auditoría Agro)
```python
consumo_total = sum([
    consumo_campo,
    consumo_planta,
    consumo_plantel,
    consumo_faenamiento,
    consumo_proceso,
    consumo_distribucion
])
```

### 3. KPIs
```python
kpi_produccion = consumo_total / produccion_anual
kpi_area = consumo_total / area_total
```

### 4. Distribución de Consumo
```python
distribucion = {
    etapa: (consumo / consumo_total) * 100
    for etapa, consumo in consumos.items()
    if consumo > 0
}
```

## Endpoints Principales

### Autenticación
- POST `/auth/register`: Registro de usuarios
- POST `/auth/token`: Obtención de token JWT

### Auditorías Básicas
- POST `/auditoria-basica/`: Crear auditoría
- GET `/auditoria-basica/`: Listar auditorías
- GET `/auditoria-basica/{id}`: Obtener auditoría específica
- PUT `/auditoria-basica/{id}`: Actualizar auditoría
- DELETE `/auditoria-basica/{id}`: Eliminar auditoría
- GET `/auditoria-basica/{id}/recomendaciones`: Obtener recomendaciones

### Auditorías Agro
- POST `/auditoria-agro/`: Crear auditoría agrícola
- GET `/auditoria-agro/`: Listar auditorías agrícolas
- GET `/auditoria-agro/{id}`: Obtener auditoría específica
- PUT `/auditoria-agro/{id}`: Actualizar auditoría
- DELETE `/auditoria-agro/{id}`: Eliminar auditoría
- GET `/auditoria-agro/{id}/recomendaciones`: Obtener recomendaciones
- GET `/auditoria-agro/{id}/metricas`: Obtener métricas calculadas

### Datos Maestros
- GET `/agro-data/industry-types`: Tipos de industria
- GET `/agro-data/equipment`: Equipamiento disponible
- GET `/agro-data/processes`: Procesos registrados
- POST `/agro-data/consumo-por-fuente`: Registrar consumo por fuente

### Panel de Control (Administración)
#### Gestión de Sectores Industriales
- GET `/admin/sectores/`: Listar sectores industriales
- POST `/admin/sectores/`: Crear nuevo sector
- PUT `/admin/sectores/{id}`: Actualizar sector
- DELETE `/admin/sectores/{id}`: Eliminar sector
- POST `/admin/sectores/importar`: Importar sectores desde CSV

#### Gestión de Benchmarks
- GET `/admin/benchmarks/`: Listar benchmarks por sector
- POST `/admin/benchmarks/`: Crear nuevo benchmark
- PUT `/admin/benchmarks/{id}`: Actualizar benchmark
- DELETE `/admin/benchmarks/{id}`: Eliminar benchmark
- GET `/admin/benchmarks/sector/{sector_id}`: Obtener benchmarks por sector

#### Gestión de Equipamiento
- GET `/admin/equipos/`: Listar tipos de equipos
- POST `/admin/equipos/`: Crear nuevo tipo de equipo
- PUT `/admin/equipos/{id}`: Actualizar tipo de equipo
- DELETE `/admin/equipos/{id}`: Eliminar tipo de equipo
- POST `/admin/equipos/eficiencia`: Registrar datos de eficiencia

#### Gestión de Recomendaciones
- GET `/admin/recomendaciones/`: Listar plantillas de recomendaciones
- POST `/admin/recomendaciones/`: Crear nueva plantilla
- PUT `/admin/recomendaciones/{id}`: Actualizar plantilla
- DELETE `/admin/recomendaciones/{id}`: Eliminar plantilla
- GET `/admin/recomendaciones/categoria/{categoria}`: Filtrar por categoría

#### Gestión de Parámetros del Sistema
- GET `/admin/parametros/`: Obtener parámetros del sistema
- PUT `/admin/parametros/`: Actualizar parámetros
- GET `/admin/parametros/calculos`: Obtener parámetros de cálculos
- PUT `/admin/parametros/calculos`: Actualizar parámetros de cálculos

#### Importación/Exportación de Datos
- POST `/admin/importar/sectores`: Importar datos de sectores
- POST `/admin/importar/benchmarks`: Importar datos de benchmarks
- GET `/admin/exportar/auditorias`: Exportar datos de auditorías
- GET `/admin/exportar/estadisticas`: Exportar estadísticas del sistema

## Documentación Adicional
- Swagger UI: `/docs`
- ReDoc: `/redoc`
- OpenAPI JSON: `/openapi.json`

## Requisitos Técnicos
- Python 3.8+
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic v2
- Python-Jose (JWT)
- Passlib
- Alembic (migraciones)
- pytest (pruebas)
- httpx (pruebas de integración)

## Estructura del Proyecto

```
audite/
├── app/                # API Backend (FastAPI)
│   ├── routers/       # Rutas de la API
│   ├── models.py      # Modelos SQLAlchemy
│   ├── schemas.py     # Esquemas Pydantic
│   ├── database.py    # Configuración de la base de datos
│   ├── crud/         # Operaciones CRUD
│   ├── utils/        # Utilidades y helpers
│   └── main.py       # Punto de entrada de la API
├── alembic/          # Migraciones de base de datos
├── tests/           # Pruebas unitarias y de integración
├── requirements.txt  # Dependencias del proyecto
└── .env             # Variables de entorno
```

## Configuración del Backend (FastAPI)

1. Instalar dependencias:
```bash
pip install -r requirements.txt
```

2. Configurar variables de entorno:
- Copiar `.env.example` a `.env`
- Ajustar la configuración según sea necesario

3. Ejecutar migraciones de base de datos:
```bash
alembic upgrade head
```

4. Ejecutar el servidor de desarrollo:
```bash
uvicorn app.main:app --reload
```

5. Ejecutar pruebas:
```bash
pytest tests/
```

La API estará disponible en `http://localhost:8000`
Documentación de la API: `http://localhost:8000/docs`

## Pruebas y Validación

El sistema incluye un conjunto completo de pruebas que verifican:
- Autenticación y gestión de usuarios
- Creación y gestión de auditorías básicas
- Creación y gestión de auditorías agrícolas
- Cálculo correcto de métricas y KPIs
- Generación de recomendaciones
- Validación de datos de entrada
- Manejo de errores y excepciones

Para ejecutar las pruebas con cobertura:
```bash
pytest --cov=app tests/
```

## Endpoints de la API

- `GET /auditorias/`: Listar todas las auditorías
- `POST /auditorias/`: Crear nueva auditoría
- `GET /auditorias/{id}`: Obtener una auditoría específica
- `PUT /auditorias/{id}`: Actualizar una auditoría
- `DELETE /auditorias/{id}`: Eliminar una auditoría

## Frontend Antiguo

El frontend original se ha movido a la carpeta `frontend_old/`. Ver el README en esa carpeta para más detalles sobre su estructura y funcionamiento. 