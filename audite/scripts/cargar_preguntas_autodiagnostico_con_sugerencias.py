#!/usr/bin/env python3
"""
Script para cargar las preguntas del autodiagnóstico con sugerencias.
Actualiza las preguntas existentes agregando sugerencias a las opciones correspondientes.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import AutodiagnosticoPregunta, AutodiagnosticoOpcion

def actualizar_sugerencias_opciones():
    """
    Actualiza las opciones existentes agregando sugerencias específicas.
    """
    db = SessionLocal()
    
    try:
        # Definir las sugerencias para cada pregunta y opción (usando valores exactos de la BD)
        sugerencias_por_pregunta = {
            1: {  # ¿Qué cultivas o produces?
                "fruta_fresca": "Considera implementar sistemas de refrigeración eficientes y control de temperatura para conservar la calidad de tus frutas. Los sistemas de frío consumen mucha energía, optimízalos con tecnología inverter.",
                "hortalizas": "Implementa sistemas de riego por goteo automatizados para reducir el consumo de agua y energía. Los cultivos de hortalizas se benefician de sistemas de monitoreo climático eficientes.",
                "cereales": "Optimiza el secado de granos con sistemas de ventilación natural cuando sea posible. Considera el uso de energía solar para el secado complementario.",
                "vino": "La vinificación requiere control preciso de temperatura. Implementa sistemas de refrigeración eficientes y considera la recuperación de calor de los procesos de fermentación.",
                "subproductos_animales": "Los procesos de transformación de subproductos requieren sistemas térmicos eficientes. Considera la cogeneración y recuperación de calor residual.",
                "agroindustria_mixta": "Para operaciones diversificadas, implementa sistemas de monitoreo energético por proceso y considera la optimización integral de todos los sistemas.",
                "otro": "Identifica los procesos más intensivos en energía de tu producción específica y considera auditorías energéticas especializadas."
            },
            2: {  # Unidad de producción
                "toneladas": "Para producciones en toneladas, es crucial implementar sistemas de pesaje automatizados y optimizar los procesos de carga/descarga para reducir tiempos de operación de equipos.",
                "litros": "En producciones líquidas, optimiza los sistemas de bombeo con variadores de frecuencia y considera la implementación de sistemas de recirculación eficientes.",
                "unidades": "Para producciones por unidades, implementa sistemas de conteo automático y optimiza los procesos de empaque para reducir tiempos de operación.",
                "cajas": "Optimiza los procesos de empacado con sistemas automatizados y considera la implementación de cintas transportadoras eficientes energéticamente.",
                "hectareas": "Para producciones por hectárea, implementa sistemas de riego eficientes y considera el monitoreo climático automatizado para optimizar el uso de equipos.",
                "otro": "Independientemente de tu unidad de medida, es importante establecer KPIs energéticos específicos para tu tipo de producción."
            },
            4: {  # Temporadas de mayor operación
                "primavera": "Durante primavera, aprovecha las temperaturas moderadas para reducir el uso de sistemas de climatización. Considera la ventilación natural.",
                "verano": "En verano, implementa sistemas de enfriamiento evaporativo y considera horarios de operación nocturnos para equipos que generen calor.",
                "otono": "El otoño es ideal para realizar mantenimientos preventivos de equipos antes del invierno. Aprovecha las temperaturas moderadas.",
                "invierno": "En invierno, optimiza los sistemas de calefacción con recuperadores de calor y considera el aislamiento térmico de instalaciones.",
                "todo_el_ano": "Para operaciones continuas, implementa sistemas de monitoreo energético en tiempo real y considera contratos de energía con tarifas diferenciadas."
            },
            5: {  # Procesos en tu planta
                "riego": "Optimiza los sistemas de riego con tecnología de goteo y sensores de humedad. Considera horarios de riego nocturnos para reducir evaporación y costos energéticos.",
                "cosecha": "Implementa equipos de cosecha eficientes y considera la planificación logística para reducir tiempos de operación de maquinaria.",
                "post_cosecha": "Los procesos post-cosecha requieren control climático preciso. Implementa sistemas de ventilación controlada y monitoreo automático.",
                "refrigeracion": "Optimiza los sistemas de refrigeración con tecnología inverter y considera la implementación de sistemas de deshielo automático.",
                "otros": "Identifica los procesos específicos más intensivos en energía y considera la implementación de sistemas de control automático."
            },
            7: {  # Equipos más relevantes
                "bombas_riego": "Optimiza los sistemas de bombeo con variadores de frecuencia y considera el redimensionamiento de bombas sobredimensionadas. Implementa sistemas de riego por goteo.",
                "camaras_frigorificas": "Las cámaras frigoríficas son grandes consumidoras. Implementa sistemas de control de temperatura precisos, mejora el aislamiento y considera tecnología inverter.",
                "motores_extraccion": "Implementa controles de velocidad variable en ventiladores y considera el mantenimiento regular de aspas y filtros para optimizar el flujo de aire.",
                "compresores": "Los compresores son grandes consumidores. Implementa sistemas de control de presión y considera la recuperación de calor residual.",
                "calefactores": "Para equipos de calentamiento, considera el uso de intercambiadores de calor y sistemas de recuperación de calor residual.",
                "iluminacion": "Migra a tecnología LED con sistemas de control automático y considera el aprovechamiento de luz natural.",
                "otros": "Identifica los equipos con mayor consumo energético y considera auditorías específicas para optimizar su operación."
            },
            9: {  # Gasto anual en electricidad
                "100k_500k": "Con gastos entre $100-500k CLP, enfócate en medidas de bajo costo como cambio a LED, optimización de horarios y mantenimiento preventivo.",
                "500k_1m": "En este rango, considera inversiones en variadores de frecuencia para motores principales y sistemas de control automático básicos.",
                "1m_5m": "Con este presupuesto, puedes implementar sistemas de monitoreo energético, equipos de alta eficiencia y considerar energía solar pequeña escala.",
                "mas_5m": "Con gastos superiores a $5M CLP, considera proyectos integrales de eficiencia energética, sistemas de energía renovable y tecnologías avanzadas."
            },
            10: {  # Qué mejorar energéticamente
                "reducir_costos": "Para reducir costos, implementa sistemas de monitoreo en tiempo real, optimiza contratos eléctricos y establece metas de reducción específicas por proceso.",
                "identificar_consumos": "Implementa sistemas de medición por circuitos y equipos principales. Considera auditorías energéticas detalladas para identificar oportunidades.",
                "optimizar_tarifas": "Analiza tu perfil de consumo para optimizar horarios de operación y considera contratos con tarifas diferenciadas o generación distribuida.",
                "mejorar_eficiencia": "La eficiencia se mejora con equipos de alta tecnología, mantenimiento preventivo y optimización de procesos operativos.",
                "indicadores_eficiencia": "Establece KPIs energéticos específicos como kWh/ton producida, kWh/hectárea, etc. Implementa sistemas de monitoreo continuo.",
                "paneles_solares": "Considera la instalación de paneles solares según tu perfil de consumo diurno. Evalúa la viabilidad económica y espacial de tu instalación.",
                "telemedicion": "Implementa sistemas de telemetría para monitoreo remoto de equipos críticos y optimización automática de procesos energéticos.",
                "otro": "Identifica necesidades específicas de tu operación y considera consultoría especializada en eficiencia energética agroindustrial."
            }
        }
        
        # Actualizar opciones con sugerencias
        for pregunta_orden, opciones_sugerencias in sugerencias_por_pregunta.items():
            pregunta = db.query(AutodiagnosticoPregunta)\
                .filter(AutodiagnosticoPregunta.numero_orden == pregunta_orden)\
                .first()
            
            if pregunta:
                print(f"Actualizando sugerencias para pregunta {pregunta_orden}: {pregunta.pregunta}")
                
                for opcion in pregunta.opciones:
                    if opcion.valor in opciones_sugerencias:
                        opcion.tiene_sugerencia = True
                        opcion.sugerencia = opciones_sugerencias[opcion.valor]
                        print(f"  - Agregada sugerencia para opción: {opcion.texto_opcion}")
                    else:
                        # Opciones sin sugerencia (como "No sé", "Otro", etc.)
                        opcion.tiene_sugerencia = False
                        opcion.sugerencia = None
            else:
                print(f"⚠️  Pregunta {pregunta_orden} no encontrada")
        
        db.commit()
        print("✅ Sugerencias actualizadas exitosamente")
        
        # Mostrar resumen
        total_opciones_con_sugerencias = db.query(AutodiagnosticoOpcion)\
            .filter(AutodiagnosticoOpcion.tiene_sugerencia == True)\
            .count()
        
        total_opciones = db.query(AutodiagnosticoOpcion).count()
        
        print(f"\n📊 Resumen:")
        print(f"   - Total opciones: {total_opciones}")
        print(f"   - Opciones con sugerencias: {total_opciones_con_sugerencias}")
        print(f"   - Opciones sin sugerencias: {total_opciones - total_opciones_con_sugerencias}")
        
    except Exception as e:
        print(f"❌ Error al actualizar sugerencias: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def mostrar_sugerencias_cargadas():
    """
    Muestra las sugerencias que se han cargado en la base de datos.
    """
    db = SessionLocal()
    
    try:
        preguntas = db.query(AutodiagnosticoPregunta)\
            .filter(AutodiagnosticoPregunta.es_activa == True)\
            .order_by(AutodiagnosticoPregunta.numero_orden)\
            .all()
        
        print("\n🔍 Sugerencias cargadas por pregunta:")
        print("=" * 80)
        
        for pregunta in preguntas:
            print(f"\n{pregunta.numero_orden}. {pregunta.pregunta}")
            print("-" * 60)
            
            opciones_con_sugerencias = [opt for opt in pregunta.opciones if opt.tiene_sugerencia]
            opciones_sin_sugerencias = [opt for opt in pregunta.opciones if not opt.tiene_sugerencia]
            
            if opciones_con_sugerencias:
                print("✅ Opciones CON sugerencias:")
                for opcion in opciones_con_sugerencias:
                    print(f"   • {opcion.texto_opcion}")
                    print(f"     💡 {opcion.sugerencia[:100]}...")
            
            if opciones_sin_sugerencias:
                print("ℹ️  Opciones SIN sugerencias:")
                for opcion in opciones_sin_sugerencias:
                    print(f"   • {opcion.texto_opcion}")
    
    except Exception as e:
        print(f"❌ Error al mostrar sugerencias: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Iniciando actualización de sugerencias para autodiagnóstico...")
    
    # Actualizar sugerencias
    actualizar_sugerencias_opciones()
    
    # Mostrar resumen de sugerencias cargadas
    mostrar_sugerencias_cargadas()
    
    print("\n✅ Proceso completado exitosamente!")
    print("\n💡 Ahora puedes usar los endpoints:")
    print("   - GET /autodiagnostico/sugerencias/{session_id}")
    print("   - GET /autodiagnostico/sesion/{session_id}/completa") 