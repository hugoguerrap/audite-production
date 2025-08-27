#!/usr/bin/env python3
"""
Script para cargar las preguntas iniciales del sistema de autodiagnóstico energético.
Ejecutar desde el directorio raíz del proyecto: python scripts/cargar_preguntas_autodiagnostico.py
"""

import sys
import os
from pathlib import Path

# Agregar el directorio padre al path para poder importar los módulos
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import AutodiagnosticoPregunta, AutodiagnosticoOpcion, Base

# Crear todas las tablas
Base.metadata.create_all(bind=engine)

# Datos de las 13 preguntas iniciales
PREGUNTAS_INICIALES = [
    {
        "numero_orden": 1,
        "pregunta": "¿Qué cultivas o produces?",
        "tipo_respuesta": "radio",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "Fruta fresca", "valor": "fruta_fresca", "orden": 1},
            {"texto_opcion": "Hortalizas", "valor": "hortalizas", "orden": 2},
            {"texto_opcion": "Vino", "valor": "vino", "orden": 3},
            {"texto_opcion": "Cereales", "valor": "cereales", "orden": 4},
            {"texto_opcion": "Subproductos animales", "valor": "subproductos_animales", "orden": 5},
            {"texto_opcion": "Agroindustria mixta", "valor": "agroindustria_mixta", "orden": 6},
            {"texto_opcion": "Otro (especificar)", "valor": "otro", "orden": 7},
            {"texto_opcion": "No sé", "valor": "no_se", "es_especial": True, "orden": 8}
        ]
    },
    {
        "numero_orden": 2,
        "pregunta": "Unidad de producción",
        "tipo_respuesta": "select",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "Cajas", "valor": "cajas", "orden": 1},
            {"texto_opcion": "Hectáreas", "valor": "hectareas", "orden": 2},
            {"texto_opcion": "Litros", "valor": "litros", "orden": 3},
            {"texto_opcion": "Toneladas", "valor": "toneladas", "orden": 4},
            {"texto_opcion": "Unidades", "valor": "unidades", "orden": 5},
            {"texto_opcion": "Otro", "valor": "otro", "orden": 6},
            {"texto_opcion": "No sé", "valor": "no_se", "es_especial": True, "orden": 7}
        ]
    },
    {
        "numero_orden": 3,
        "pregunta": "Cantidad anual estimada:",
        "tipo_respuesta": "number",
        "es_obligatoria": False,
        "ayuda_texto": "Ingrese la cantidad de producción anual. Puede dejar en blanco si no sabe.",
        "opciones": [
            {"texto_opcion": "No sé", "valor": "no_se", "es_especial": True, "orden": 1}
        ]
    },
    {
        "numero_orden": 4,
        "pregunta": "Temporadas de mayor operación (marca todas las que apliquen)",
        "tipo_respuesta": "checkbox",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "Verano", "valor": "verano", "orden": 1},
            {"texto_opcion": "Otoño", "valor": "otono", "orden": 2},
            {"texto_opcion": "Invierno", "valor": "invierno", "orden": 3},
            {"texto_opcion": "Primavera", "valor": "primavera", "orden": 4},
            {"texto_opcion": "Todo el año", "valor": "todo_el_ano", "orden": 5},
            {"texto_opcion": "No sé", "valor": "no_se", "es_especial": True, "orden": 6}
        ]
    },
    {
        "numero_orden": 5,
        "pregunta": "¿Cuáles son los procesos en tu planta? (marca los que correspondan)",
        "tipo_respuesta": "checkbox",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "Riego", "valor": "riego", "orden": 1},
            {"texto_opcion": "Cosecha", "valor": "cosecha", "orden": 2},
            {"texto_opcion": "Post-cosecha", "valor": "post_cosecha", "orden": 3},
            {"texto_opcion": "Refrigeración", "valor": "refrigeracion", "orden": 4},
            {"texto_opcion": "Otros (especificar)", "valor": "otros", "orden": 5},
            {"texto_opcion": "No sé", "valor": "no_se", "es_especial": True, "orden": 6}
        ]
    },
    {
        "numero_orden": 6,
        "pregunta": "Ordena de mayor a menor consumo los procesos seleccionados en la pregunta 5 e indica un porcentaje para cada uno",
        "tipo_respuesta": "text",
        "es_obligatoria": False,
        "ayuda_texto": "Ejemplo: 1. Refrigeración (40%), 2. Riego (30%), 3. Post-cosecha (20%), 4. Cosecha (10%)",
        "opciones": []
    },
    {
        "numero_orden": 7,
        "pregunta": "Equipos energéticamente más relevantes en tu operación (marca los que correspondan)",
        "tipo_respuesta": "checkbox",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "Bombas de riego", "valor": "bombas_riego", "orden": 1},
            {"texto_opcion": "Cámaras frigoríficas", "valor": "camaras_frigorificas", "orden": 2},
            {"texto_opcion": "Motores de extracción o ventilación", "valor": "motores_extraccion", "orden": 3},
            {"texto_opcion": "Compresores", "valor": "compresores", "orden": 4},
            {"texto_opcion": "Calefactores", "valor": "calefactores", "orden": 5},
            {"texto_opcion": "Iluminación", "valor": "iluminacion", "orden": 6},
            {"texto_opcion": "Otros (especificar)", "valor": "otros", "orden": 7},
            {"texto_opcion": "No sé", "valor": "no_se", "es_especial": True, "orden": 8}
        ]
    },
    {
        "numero_orden": 8,
        "pregunta": "Consumo de electricidad del último mes (kWh):",
        "tipo_respuesta": "number",
        "es_obligatoria": False,
        "ayuda_texto": "Ingrese el consumo en kWh según su última factura eléctrica. También puede adjuntar una foto de la cuenta.",
        "opciones": [
            {"texto_opcion": "No sé", "valor": "no_se", "es_especial": True, "orden": 1},
            {"texto_opcion": "Adjuntar foto/archivo de la cuenta eléctrica", "valor": "adjuntar_archivo", "es_especial": True, "orden": 2}
        ]
    },
    {
        "numero_orden": 9,
        "pregunta": "Gasto anual aproximado en electricidad:",
        "tipo_respuesta": "radio",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "$100.000 – $500.000 CLP", "valor": "100k_500k", "orden": 1},
            {"texto_opcion": "$500.001 – $1.000.000 CLP", "valor": "500k_1m", "orden": 2},
            {"texto_opcion": "$1.000.001 – $5.000.000 CLP", "valor": "1m_5m", "orden": 3},
            {"texto_opcion": "Más de $5.000.000 CLP", "valor": "mas_5m", "orden": 4},
            {"texto_opcion": "No sé", "valor": "no_se", "es_especial": True, "orden": 5}
        ]
    },
    {
        "numero_orden": 10,
        "pregunta": "¿Qué te gustaría conocer o mejorar desde el punto de vista energético? (marca lo que aplique)",
        "tipo_respuesta": "checkbox",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "Reducir costos energéticos", "valor": "reducir_costos", "orden": 1},
            {"texto_opcion": "Identificar los principales consumos", "valor": "identificar_consumos", "orden": 2},
            {"texto_opcion": "Optimizar tarifas y contratos eléctricos", "valor": "optimizar_tarifas", "orden": 3},
            {"texto_opcion": "Mejorar la eficiencia de equipos", "valor": "mejorar_eficiencia", "orden": 4},
            {"texto_opcion": "Establecer indicadores de eficiencia", "valor": "indicadores_eficiencia", "orden": 5},
            {"texto_opcion": "Implementar paneles solares", "valor": "paneles_solares", "orden": 6},
            {"texto_opcion": "Implementar telemedición en equipos o procesos", "valor": "telemedicion", "orden": 7},
            {"texto_opcion": "Otro (especificar)", "valor": "otro", "orden": 8}
        ]
    },
    {
        "numero_orden": 11,
        "pregunta": "¿Te gustaría que te contactemos para ayudarte a mejorar tus consumos energéticos y reducir tus costos?",
        "tipo_respuesta": "radio",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "Sí", "valor": "si", "orden": 1},
            {"texto_opcion": "No", "valor": "no", "orden": 2}
        ]
    },
    {
        "numero_orden": 12,
        "pregunta": "Déjanos tus datos de contacto",
        "tipo_respuesta": "text",
        "es_obligatoria": False,
        "ayuda_texto": "Nombre, Email, Teléfono (uno por línea)",
        "opciones": []
    },
    {
        "numero_orden": 13,
        "pregunta": "¿Te gustaría recibir mensualmente recomendaciones para reducir costos y comparar tu empresa con otras similares?",
        "tipo_respuesta": "radio",
        "es_obligatoria": True,
        "opciones": [
            {"texto_opcion": "Sí", "valor": "si", "orden": 1},
            {"texto_opcion": "No", "valor": "no", "orden": 2}
        ]
    }
]

def cargar_preguntas():
    """Carga las preguntas iniciales en la base de datos."""
    db = SessionLocal()
    
    try:
        print("🔄 Iniciando carga de preguntas de autodiagnóstico...")
        
        # Verificar si ya existen preguntas
        preguntas_existentes = db.query(AutodiagnosticoPregunta).count()
        if preguntas_existentes > 0:
            print(f"⚠️  Ya existen {preguntas_existentes} preguntas en la base de datos.")
            respuesta = input("¿Desea continuar y agregar más preguntas? (s/N): ")
            if respuesta.lower() not in ['s', 'si', 'sí', 'yes', 'y']:
                print("❌ Operación cancelada.")
                return
        
        preguntas_creadas = 0
        
        for pregunta_data in PREGUNTAS_INICIALES:
            # Verificar si la pregunta ya existe por número de orden
            pregunta_existente = db.query(AutodiagnosticoPregunta)\
                .filter(AutodiagnosticoPregunta.numero_orden == pregunta_data["numero_orden"])\
                .first()
            
            if pregunta_existente:
                print(f"⏭️  Pregunta {pregunta_data['numero_orden']} ya existe, saltando...")
                continue
            
            # Crear la pregunta
            nueva_pregunta = AutodiagnosticoPregunta(
                numero_orden=pregunta_data["numero_orden"],
                pregunta=pregunta_data["pregunta"],
                tipo_respuesta=pregunta_data["tipo_respuesta"],
                es_obligatoria=pregunta_data["es_obligatoria"],
                ayuda_texto=pregunta_data.get("ayuda_texto")
            )
            
            db.add(nueva_pregunta)
            db.flush()  # Para obtener el ID
            
            # Crear las opciones
            for opcion_data in pregunta_data["opciones"]:
                nueva_opcion = AutodiagnosticoOpcion(
                    pregunta_id=nueva_pregunta.id,
                    texto_opcion=opcion_data["texto_opcion"],
                    valor=opcion_data["valor"],
                    es_por_defecto=opcion_data.get("es_por_defecto", False),
                    es_especial=opcion_data.get("es_especial", False),
                    orden=opcion_data["orden"]
                )
                db.add(nueva_opcion)
            
            preguntas_creadas += 1
            print(f"✅ Pregunta {pregunta_data['numero_orden']}: '{pregunta_data['pregunta'][:50]}...' creada con {len(pregunta_data['opciones'])} opciones")
        
        db.commit()
        print(f"\n🎉 ¡Carga completada! Se crearon {preguntas_creadas} preguntas nuevas.")
        print(f"📊 Total de preguntas en la base de datos: {db.query(AutodiagnosticoPregunta).count()}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar preguntas: {str(e)}")
        raise
    finally:
        db.close()

def verificar_carga():
    """Verifica que las preguntas se hayan cargado correctamente."""
    db = SessionLocal()
    
    try:
        print("\n🔍 Verificando carga de preguntas...")
        
        preguntas = db.query(AutodiagnosticoPregunta)\
            .order_by(AutodiagnosticoPregunta.numero_orden)\
            .all()
        
        print(f"📊 Total de preguntas: {len(preguntas)}")
        
        for pregunta in preguntas:
            opciones_count = len(pregunta.opciones)
            print(f"  {pregunta.numero_orden}. {pregunta.pregunta[:60]}... ({opciones_count} opciones)")
        
        print("✅ Verificación completada.")
        
    except Exception as e:
        print(f"❌ Error en verificación: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Script de carga de preguntas de autodiagnóstico energético")
    print("=" * 60)
    
    cargar_preguntas()
    verificar_carga()
    
    print("\n💡 Ahora puedes probar los endpoints:")
    print("   GET /autodiagnostico/preguntas - Ver preguntas públicas")
    print("   GET /autodiagnostico/admin/preguntas - Gestión admin (requiere auth)")
    print("   POST /autodiagnostico/responder - Enviar respuestas") 