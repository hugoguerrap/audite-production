#!/usr/bin/env python3
"""
Script para limpiar todos los datos de respuestas del autodiagnóstico.
ATENCIÓN: Este script eliminará TODAS las respuestas y sesiones existentes.
Úsalo solo cuando quieras limpiar completamente la base de datos antes de entregar al cliente.
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Agregar el directorio padre al path para importar los modelos
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

try:
    from app.models.autodiagnostico import AutodiagnosticoRespuesta
    from app.database import get_db_url
except ImportError as e:
    print(f"Error de importación: {e}")
    print("Intentando importación alternativa...")
    
    # Importación alternativa usando la URL directamente
    import os
    from dotenv import load_dotenv
    
    # Cargar variables de entorno
    load_dotenv()
    
    def get_db_url_alt():
        return os.getenv("DATABASE_URL")
    
    # Definir el modelo directamente
    from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
    from sqlalchemy.ext.declarative import declarative_base
    from datetime import datetime
    
    Base = declarative_base()
    
    class AutodiagnosticoRespuesta(Base):
        __tablename__ = "autodiagnostico_respuestas"
        
        id = Column(String, primary_key=True)
        session_id = Column(String, nullable=False, index=True)
        pregunta_id = Column(Integer, nullable=False)
        respuesta_texto = Column(Text)
        respuesta_numero = Column(Integer)
        opciones_seleccionadas = Column(Text)
        opcion_seleccionada = Column(String)
        archivo_adjunto = Column(String)
        ip_address = Column(String)
        user_agent = Column(Text)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    get_db_url = get_db_url_alt

def confirmar_limpieza():
    """Pedir confirmación al usuario antes de proceder."""
    print("⚠️  ADVERTENCIA: Este script eliminará TODAS las respuestas del autodiagnóstico.")
    print("   Esto incluye:")
    print("   - Todas las sesiones de usuarios")
    print("   - Todas las respuestas a las preguntas")
    print("   - Todos los datos de IP y user agent")
    print()
    print("   Las PREGUNTAS y OPCIONES se mantendrán intactas.")
    print()
    
    respuesta = input("¿Estás seguro de que quieres continuar? (escribe 'SI CONFIRMO' para proceder): ")
    
    if respuesta.strip() != "SI CONFIRMO":
        print("❌ Operación cancelada por el usuario.")
        return False
    
    print()
    respuesta2 = input("¿Realmente estás seguro? Esta acción NO se puede deshacer (escribe 'CONFIRMO' nuevamente): ")
    
    if respuesta2.strip() != "CONFIRMO":
        print("❌ Operación cancelada por el usuario.")
        return False
    
    return True

def limpiar_datos():
    """Eliminar todas las respuestas del autodiagnóstico."""
    try:
        # Crear conexión a la base de datos
        DATABASE_URL = get_db_url()
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        db = SessionLocal()
        
        print("🔄 Conectando a la base de datos...")
        
        # Contar respuestas antes de eliminar
        total_respuestas = db.query(AutodiagnosticoRespuesta).count()
        total_sesiones = db.query(AutodiagnosticoRespuesta.session_id).distinct().count()
        
        print(f"📊 Datos encontrados:")
        print(f"   - Total de respuestas: {total_respuestas}")
        print(f"   - Total de sesiones únicas: {total_sesiones}")
        
        if total_respuestas == 0:
            print("✅ No hay datos para limpiar. La base de datos ya está limpia.")
            return
        
        print()
        print("🗑️  Eliminando todas las respuestas...")
        
        # Eliminar todas las respuestas
        deleted_count = db.query(AutodiagnosticoRespuesta).delete()
        
        # Confirmar cambios
        db.commit()
        
        print(f"✅ Limpieza completada exitosamente:")
        print(f"   - Respuestas eliminadas: {deleted_count}")
        print(f"   - Sesiones eliminadas: {total_sesiones}")
        print()
        print("💡 Las preguntas y opciones se mantuvieron intactas.")
        print("💡 El sistema está listo para ser entregado al cliente.")
        
    except Exception as e:
        print(f"❌ Error durante la limpieza: {e}")
        if 'db' in locals():
            db.rollback()
        return False
    
    finally:
        if 'db' in locals():
            db.close()
    
    return True

def verificar_limpieza():
    """Verificar que la limpieza fue exitosa."""
    try:
        DATABASE_URL = get_db_url()
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        db = SessionLocal()
        
        total_respuestas = db.query(AutodiagnosticoRespuesta).count()
        
        if total_respuestas == 0:
            print("✅ Verificación exitosa: No quedan respuestas en la base de datos.")
        else:
            print(f"⚠️  Advertencia: Aún quedan {total_respuestas} respuestas en la base de datos.")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Error durante la verificación: {e}")

def main():
    print("🧹 Script de Limpieza de Datos del Autodiagnóstico")
    print("=" * 50)
    print()
    
    # Confirmar con el usuario
    if not confirmar_limpieza():
        return
    
    print()
    print("🚀 Iniciando limpieza de datos...")
    print()
    
    # Realizar la limpieza
    if limpiar_datos():
        print()
        print("🔍 Verificando limpieza...")
        verificar_limpieza()
        print()
        print("🎉 ¡Proceso completado! El sistema está listo para el cliente.")
    else:
        print()
        print("❌ La limpieza no se completó correctamente.")

if __name__ == "__main__":
    main() 