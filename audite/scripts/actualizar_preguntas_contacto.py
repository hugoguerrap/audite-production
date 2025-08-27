"""
Script para actualizar las preguntas de contacto del autodiagnóstico.
Reemplaza la pregunta 12 con múltiples preguntas específicas para datos de contacto.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models import AutodiagnosticoPregunta, AutodiagnosticoOpcion

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def actualizar_preguntas_contacto():
    """Actualiza las preguntas de contacto para que sean más útiles."""
    db = SessionLocal()
    
    try:
        print("🔄 Actualizando preguntas de contacto...")
        
        # Eliminar la pregunta 12 anterior (datos de contacto genéricos)
        pregunta_12 = db.query(AutodiagnosticoPregunta)\
            .filter(AutodiagnosticoPregunta.numero_orden == 12)\
            .first()
        
        if pregunta_12:
            # Eliminar opciones asociadas
            db.query(AutodiagnosticoOpcion)\
                .filter(AutodiagnosticoOpcion.pregunta_id == pregunta_12.id)\
                .delete()
            
            # Actualizar la pregunta 12 para ser nombre
            pregunta_12.pregunta = "Tu nombre completo:"
            pregunta_12.tipo_respuesta = "text"
            pregunta_12.es_obligatoria = False
            pregunta_12.ayuda_texto = "Ingresa tu nombre y apellido"
            
            print("✅ Pregunta 12 actualizada: Nombre completo")
        
        # Verificar si ya existe pregunta 14 (para email)
        pregunta_14 = db.query(AutodiagnosticoPregunta)\
            .filter(AutodiagnosticoPregunta.numero_orden == 14)\
            .first()
        
        if not pregunta_14:
            # Crear pregunta 14 para email
            nueva_pregunta_email = AutodiagnosticoPregunta(
                numero_orden=14,
                pregunta="Tu email:",
                tipo_respuesta="text",
                es_obligatoria=False,
                ayuda_texto="Para recibir recomendaciones personalizadas"
            )
            db.add(nueva_pregunta_email)
            db.flush()
            
            print("✅ Pregunta 14 creada: Email")
        
        # Verificar si ya existe pregunta 15 (para teléfono)
        pregunta_15 = db.query(AutodiagnosticoPregunta)\
            .filter(AutodiagnosticoPregunta.numero_orden == 15)\
            .first()
        
        if not pregunta_15:
            # Crear pregunta 15 para teléfono
            nueva_pregunta_telefono = AutodiagnosticoPregunta(
                numero_orden=15,
                pregunta="Tu teléfono (opcional):",
                tipo_respuesta="text",
                es_obligatoria=False,
                ayuda_texto="Para contactarte directamente si lo necesitas"
            )
            db.add(nueva_pregunta_telefono)
            db.flush()
            
            print("✅ Pregunta 15 creada: Teléfono")
        
        # Verificar si ya existe pregunta 16 (para empresa)
        pregunta_16 = db.query(AutodiagnosticoPregunta)\
            .filter(AutodiagnosticoPregunta.numero_orden == 16)\
            .first()
        
        if not pregunta_16:
            # Crear pregunta 16 para empresa
            nueva_pregunta_empresa = AutodiagnosticoPregunta(
                numero_orden=16,
                pregunta="Nombre de tu empresa/finca:",
                tipo_respuesta="text",
                es_obligatoria=False,
                ayuda_texto="Para contextualizar mejor las recomendaciones"
            )
            db.add(nueva_pregunta_empresa)
            db.flush()
            
            print("✅ Pregunta 16 creada: Empresa/Finca")
        
        # Actualizar la pregunta 13 para que sea la última
        pregunta_13 = db.query(AutodiagnosticoPregunta)\
            .filter(AutodiagnosticoPregunta.numero_orden == 13)\
            .first()
        
        if pregunta_13:
            # Mover la pregunta 13 al final (número 17)
            pregunta_13.numero_orden = 17
            print("✅ Pregunta 13 movida al final como pregunta 17")
        
        db.commit()
        print(f"\n🎉 ¡Actualización completada!")
        
        # Verificar el nuevo estado
        total_preguntas = db.query(AutodiagnosticoPregunta).count()
        print(f"📊 Total de preguntas ahora: {total_preguntas}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al actualizar preguntas: {str(e)}")
        raise
    finally:
        db.close()

def verificar_preguntas():
    """Verifica el estado de las preguntas."""
    db = SessionLocal()
    
    try:
        print("\n🔍 Verificando preguntas actualizadas...")
        
        preguntas = db.query(AutodiagnosticoPregunta)\
            .order_by(AutodiagnosticoPregunta.numero_orden)\
            .all()
        
        print(f"📊 Total de preguntas: {len(preguntas)}")
        
        for pregunta in preguntas:
            opciones_count = len(pregunta.opciones)
            obligatoria = "* " if pregunta.es_obligatoria else "  "
            print(f"{obligatoria}{pregunta.numero_orden:2d}. {pregunta.pregunta[:50]}... ({pregunta.tipo_respuesta}) ({opciones_count} opciones)")
        
        print("\n✅ Verificación completada.")
        
    except Exception as e:
        print(f"❌ Error en verificación: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Script de actualización de preguntas de contacto")
    print("=" * 60)
    
    actualizar_preguntas_contacto()
    verificar_preguntas()
    
    print("\n💡 Las preguntas de contacto ahora son más específicas:")
    print("   12. Nombre completo")
    print("   13. (desplazada a 17)")
    print("   14. Email") 
    print("   15. Teléfono")
    print("   16. Empresa/Finca")
    print("   17. Recibir recomendaciones mensuales") 