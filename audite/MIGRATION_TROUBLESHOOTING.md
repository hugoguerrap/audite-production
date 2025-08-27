# 🚨 GUÍA DE RESOLUCIÓN DE PROBLEMAS DE MIGRACIONES

## PROBLEMA COMÚN: Múltiples Heads

### Síntomas:
- `alembic upgrade head` falla
- Error: "Multiple heads in the database"
- Migraciones no se aplican

### SOLUCIÓN 1: Resolver Heads Automáticamente
```bash
# 1. Activar entorno
source venv/bin/activate  # o el path correcto

# 2. Ver heads actuales  
alembic heads

# 3. Resolver automáticamente
alembic merge heads -m "resolve_conflicts_$(date +%Y%m%d)"

# 4. Aplicar
alembic upgrade head
```

### SOLUCIÓN 2: Reset Completo (DESARROLLO)
```bash
# ⚠️ SOLO EN DESARROLLO - PERDERÁS DATOS

# 1. Eliminar base de datos local
rm -f audite.db

# 2. Eliminar migraciones problemáticas
cd alembic/versions
rm -f *merge*heads*.py

# 3. Crear migración fresca
alembic revision --autogenerate -m "fresh_start"

# 4. Aplicar
alembic upgrade head
```

### SOLUCIÓN 3: Stamp y Rebuild (PRODUCCIÓN)
```bash
# ⚠️ PARA PRODUCCIÓN - MÁS SEGURO

# 1. Marcar como actual sin aplicar cambios
alembic stamp head

# 2. Crear nueva migración incremental
alembic revision --autogenerate -m "sync_production_state"

# 3. Revisar la migración generada
# 4. Si está correcta, aplicar
alembic upgrade head
```

## PREVENCIÓN DE PROBLEMAS FUTUROS

### 1. Configuración Consistente
```python
# En database.py, usar siempre variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    if os.getenv("ENVIRONMENT") == "production":
        raise ValueError("DATABASE_URL requerida en producción")
    else:
        DATABASE_URL = "sqlite:///./audite.db"
```

### 2. Alembic.ini Dinámico
```ini
# En alembic.ini, no hardcodear la URL
sqlalchemy.url = 
```

```python
# En alembic/env.py
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))
```

### 3. Workflow de Migraciones
```bash
# SIEMPRE hacer esto antes de crear migraciones:
git pull origin main
alembic upgrade head
alembic revision --autogenerate -m "descriptive_name"
git add . && git commit -m "feat: add migration for X"
```

### 4. Sincronización Equipo
```bash
# Al cambiar de rama:
git checkout nueva-rama
alembic upgrade head  # Aplicar migraciones de la rama

# Antes de push:
alembic upgrade head  # Verificar que funciona
```

## COMANDOS ÚTILES DE DIAGNÓSTICO

```bash
# Ver estado actual
alembic current

# Ver todas las versiones disponibles
alembic history

# Ver heads (debería ser solo 1)
alembic heads

# Ver migraciones pendientes
alembic show head

# Aplicar migración específica
alembic upgrade <revision_id>

# Rollback a versión específica
alembic downgrade <revision_id>

# Marcar como aplicada sin ejecutar
alembic stamp <revision_id>
```

## CONFIGURACIÓN RECOMENDADA

### database.py
```python
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuración dinámica de base de datos
def get_database_url():
    db_url = os.getenv("DATABASE_URL")
    
    if not db_url:
        env = os.getenv("ENVIRONMENT", "development")
        if env == "production":
            raise ValueError("DATABASE_URL es requerida en producción")
        else:
            db_url = "sqlite:///./audite.db"
            print("⚠️ Usando SQLite para desarrollo")
    else:
        print(f"✅ Usando BD: {db_url.split('@')[0]}@***")
    
    return db_url

DATABASE_URL = get_database_url()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### alembic/env.py
```python
# Configuración dinámica en env.py
from app.database import DATABASE_URL
config.set_main_option("sqlalchemy.url", DATABASE_URL)
```

## ARCHIVOS A LIMPIAR

Estos archivos en tu proyecto causan conflictos:
- `31eb05c986de_merge_multiple_heads.py` ❌
- `4e4cfbf0d874_merge_heads.py` ❌  
- `add_*.py` sin timestamp ❌
- `fix_*.py` sin timestamp ❌
- `update_*.py` sin timestamp ❌

## ESTRATEGIA A LARGO PLAZO

1. **Desarrollo Local**: Siempre SQLite
2. **Testing/Staging**: PostgreSQL separada  
3. **Producción**: PostgreSQL principal
4. **Migraciones**: Siempre autogenerar, nunca manual
5. **Branches**: Cada feature en rama separada
6. **Deploy**: Pipeline automático con validación de migraciones