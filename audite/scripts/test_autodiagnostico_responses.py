#!/usr/bin/env python3
"""
Script de prueba para generar respuestas de ejemplo del autodiagnóstico.
Esto ayudará a probar la funcionalidad de visualización de respuestas en el panel de administración.
"""

import requests
import json
import uuid
from datetime import datetime

# Configuración
API_BASE_URL = "http://localhost:8000"

def obtener_preguntas():
    """Obtiene las preguntas activas del autodiagnóstico."""
    try:
        response = requests.get(f"{API_BASE_URL}/autodiagnostico/preguntas")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error al obtener preguntas: {e}")
        return []

def generar_respuesta_ejemplo(pregunta):
    """Genera una respuesta de ejemplo para una pregunta."""
    tipo = pregunta['tipo_respuesta']
    
    if tipo == 'radio' or tipo == 'select':
        # Seleccionar la primera opción disponible
        if pregunta['opciones']:
            return {"opcion_seleccionada": pregunta['opciones'][0]['valor']}
    
    elif tipo == 'checkbox':
        # Seleccionar las primeras dos opciones si están disponibles
        if pregunta['opciones']:
            opciones = [opt['valor'] for opt in pregunta['opciones'][:2]]
            return {"opciones_seleccionadas": opciones}
    
    elif tipo == 'text':
        # Generar texto de ejemplo basado en la pregunta
        if 'nombre' in pregunta['pregunta'].lower():
            return {"respuesta_texto": "Juan Pérez"}
        elif 'email' in pregunta['pregunta'].lower():
            return {"respuesta_texto": "juan.perez@ejemplo.com"}
        elif 'teléfono' in pregunta['pregunta'].lower() or 'telefono' in pregunta['pregunta'].lower():
            return {"respuesta_texto": "+57 300 123 4567"}
        elif 'empresa' in pregunta['pregunta'].lower() or 'finca' in pregunta['pregunta'].lower():
            return {"respuesta_texto": "Finca El Progreso"}
        else:
            return {"respuesta_texto": "Respuesta de ejemplo"}
    
    elif tipo == 'number':
        # Generar número de ejemplo basado en la pregunta
        if 'hectárea' in pregunta['pregunta'].lower():
            return {"respuesta_numero": 50}
        elif 'kw' in pregunta['pregunta'].lower() or 'kilovatio' in pregunta['pregunta'].lower():
            return {"respuesta_numero": 25}
        elif 'peso' in pregunta['pregunta'].lower() or 'kg' in pregunta['pregunta'].lower():
            return {"respuesta_numero": 1000}
        elif 'pesos' in pregunta['pregunta'].lower() or 'dinero' in pregunta['pregunta'].lower():
            return {"respuesta_numero": 500000}
        else:
            return {"respuesta_numero": 100}
    
    return {}

def enviar_respuestas_sesion(preguntas, session_id):
    """Envía todas las respuestas de una sesión."""
    respuestas = []
    
    for pregunta in preguntas:
        respuesta_data = generar_respuesta_ejemplo(pregunta)
        if respuesta_data:
            respuesta = {
                "session_id": session_id,
                "pregunta_id": pregunta['id'],
                **respuesta_data
            }
            respuestas.append(respuesta)
    
    payload = {"respuestas": respuestas}
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/autodiagnostico/responder",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        print(f"✅ Sesión {session_id[:8]}... enviada exitosamente")
        return result
    except Exception as e:
        print(f"❌ Error al enviar sesión {session_id[:8]}...: {e}")
        return None

def main():
    print("🚀 Iniciando script de prueba para autodiagnóstico...")
    
    # Obtener preguntas
    print("📋 Obteniendo preguntas...")
    preguntas = obtener_preguntas()
    
    if not preguntas:
        print("❌ No se pudieron obtener las preguntas. Verifica que el servidor esté ejecutándose.")
        return
    
    print(f"✅ Se obtuvieron {len(preguntas)} preguntas")
    
    # Generar 3 sesiones de ejemplo
    num_sesiones = 3
    print(f"📝 Generando {num_sesiones} sesiones de ejemplo...")
    
    for i in range(num_sesiones):
        session_id = str(uuid.uuid4())
        print(f"\n🔄 Procesando sesión {i+1}/{num_sesiones} (ID: {session_id[:8]}...)")
        
        result = enviar_respuestas_sesion(preguntas, session_id)
        if result:
            print(f"   📊 Total respuestas: {result.get('total_respuestas', 0)}")
    
    print(f"\n🎉 Script completado. Se generaron {num_sesiones} sesiones de prueba.")
    print("💡 Ahora puedes revisar las respuestas en el panel de administración:")
    print("   http://localhost:8080/admin")

if __name__ == "__main__":
    main() 