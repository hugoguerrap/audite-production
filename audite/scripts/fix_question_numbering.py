#!/usr/bin/env python3
"""
Script para corregir la numeración de las preguntas del autodiagnóstico.
Corrige el salto de numeración de 12 a 14 y reorganiza las preguntas de contacto.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv(
    'DATABASE_URL', 
    '"postgresql://[SECRET-REMOVED]""[REMOVED-SECRET]"@audite-db-do-user-7989205-0.d.db.ondigitalocean.com:25060/defaultdb?sslmode=require'
)

def fix_question_numbering():
    """Corregir la numeración de las preguntas."""
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("🔧 Corrigiendo numeración de preguntas...")
        
        # Actualizar la pregunta 14 para que sea la 13
        db.execute(text("""
            UPDATE autodiagnostico_preguntas 
            SET numero_orden = 13 
            WHERE numero_orden = 14
        """))
        
        # Actualizar la pregunta 15 para que sea la 14
        db.execute(text("""
            UPDATE autodiagnostico_preguntas 
            SET numero_orden = 14 
            WHERE numero_orden = 15
        """))
        
        # Actualizar la pregunta 16 para que sea la 15
        db.execute(text("""
            UPDATE autodiagnostico_preguntas 
            SET numero_orden = 15 
            WHERE numero_orden = 16
        """))
        
        # Actualizar la pregunta 17 para que sea la 16
        db.execute(text("""
            UPDATE autodiagnostico_preguntas 
            SET numero_orden = 16 
            WHERE numero_orden = 17
        """))
        
        # Mejorar el texto de la pregunta 12 para agrupar los datos de contacto
        db.execute(text("""
            UPDATE autodiagnostico_preguntas 
            SET pregunta = 'Déjanos tus datos de contacto',
                ayuda_texto = 'Necesitamos estos datos para poder contactarte con recomendaciones personalizadas'
            WHERE numero_orden = 12
        """))
        
        db.commit()
        
        print("✅ Numeración corregida exitosamente:")
        print("   - Pregunta 12: Datos de contacto (nombre)")
        print("   - Pregunta 13: Email")
        print("   - Pregunta 14: Teléfono")
        print("   - Pregunta 15: Empresa/finca")
        print("   - Pregunta 16: Recomendaciones mensuales")
        
        # Verificar el resultado
        result = db.execute(text("""
            SELECT numero_orden, pregunta 
            FROM autodiagnostico_preguntas 
            WHERE es_activa = true 
            ORDER BY numero_orden
        """))
        
        print("\n📋 Numeración actual:")
        for row in result:
            print(f"   {row.numero_orden}. {row.pregunta[:50]}...")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

def update_question_6_for_ordering():
    """Actualizar la pregunta 6 para soportar ordenamiento de procesos."""
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("\n🔧 Actualizando pregunta 6 para ordenamiento de procesos...")
        
        # Cambiar el tipo de respuesta de la pregunta 6 a 'ordering'
        db.execute(text("""
            UPDATE autodiagnostico_preguntas 
            SET tipo_respuesta = 'ordering',
                ayuda_texto = 'Arrastra los procesos para ordenarlos de mayor a menor consumo energético e indica el porcentaje aproximado de cada uno. Los porcentajes deben sumar 100%.'
            WHERE numero_orden = 6
        """))
        
        db.commit()
        
        print("✅ Pregunta 6 actualizada para soportar ordenamiento con porcentajes")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    print("🔧 Script de Corrección de Numeración y Funcionalidad")
    print("=" * 55)
    
    fix_question_numbering()
    update_question_6_for_ordering()
    
    print("\n🎉 ¡Correcciones completadas!")
    print("💡 El formulario ahora tiene numeración secuencial correcta")
    print("💡 La pregunta 6 está preparada para ordenamiento interactivo")

if __name__ == "__main__":
    main() 