#!/usr/bin/env python3
"""
Script para diagnosticar el estado de las migraciones
"""
import os
import sys
from sqlalchemy import create_engine, text
from alembic.config import Config
from alembic import script
from alembic.runtime import migration

# Configuración de base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./audite.db")

def check_migration_status():
    """Verificar estado actual de migraciones"""
    print("🔍 DIAGNÓSTICO DE MIGRACIONES")
    print("=" * 50)
    
    # 1. Conectar a la base de datos
    try:
        engine = create_engine(DATABASE_URL)
        print(f"✅ Conexión exitosa: {DATABASE_URL.split('@')[0]}@***")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 2. Verificar tabla alembic_version
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version_num FROM alembic_version LIMIT 1"))
            current_version = result.scalar()
            print(f"📍 Versión actual en BD: {current_version}")
    except Exception as e:
        print(f"⚠️  Tabla alembic_version no encontrada: {e}")
        current_version = None
    
    # 3. Verificar archivos de migración
    alembic_cfg = Config("alembic.ini")
    script_dir = script.ScriptDirectory.from_config(alembic_cfg)
    
    # Obtener todas las revisiones
    revisions = list(script_dir.walk_revisions())
    print(f"📁 Migraciones encontradas: {len(revisions)}")
    
    # 4. Verificar heads múltiples
    heads = script_dir.get_heads()
    print(f"🔗 Heads actuales: {len(heads)}")
    for head in heads:
        print(f"   - {head}")
    
    if len(heads) > 1:
        print("⚠️  MÚLTIPLES HEADS DETECTADOS - Esto causa conflictos")
    
    # 5. Verificar migración actual vs disponible
    if current_version:
        try:
            current_rev = script_dir.get_revision(current_version)
            print(f"✅ Migración actual válida: {current_rev.revision}")
        except Exception:
            print(f"❌ Migración actual inválida: {current_version}")
    
    # 6. Mostrar últimas 5 migraciones
    print("\n📜 ÚLTIMAS 5 MIGRACIONES:")
    for i, rev in enumerate(revisions[:5]):
        status = "🔄" if rev.revision == current_version else "⏳"
        print(f"   {status} {rev.revision}: {rev.doc}")
    
    return {
        "current_version": current_version,
        "total_migrations": len(revisions),
        "heads_count": len(heads),
        "heads": heads,
        "has_conflicts": len(heads) > 1
    }

if __name__ == "__main__":
    status = check_migration_status()
    
    if status["has_conflicts"]:
        print("\n🚨 ACCIÓN REQUERIDA:")
        print("   1. Resolver múltiples heads")
        print("   2. Ejecutar: alembic merge heads")
        print("   3. O limpiar migraciones conflictivas")