import requests
import json
from datetime import datetime
import random
import string

# Configuración base
BASE_URL = "http://localhost:8000"  # Ajusta según tu configuración
headers = {
    "Content-Type": "application/json"
}

# Credenciales de prueba
TEST_EMAIL = "admin@example.com"
TEST_PASSWORD = "admin123"

def generate_random_email():
    """Genera un email aleatorio para pruebas"""
    random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    return f"test_{random_string}@example.com"

def print_response(response, message):
    print(f"\n=== {message} ===")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {response.json() if response.text else 'No content'}")
    except json.JSONDecodeError:
        print(f"Response: {response.text}")
    return response.json() if response.text else None

# 1. Pruebas de Usuario
def test_user_endpoints():
    print("\n🔹 PROBANDO ENDPOINTS DE USUARIO 🔹")
    
    # Intentar crear un nuevo usuario
    new_email = generate_random_email()
    print(f"Intentando crear nuevo usuario con email: {new_email}")
    
    user_data = {
        "email": new_email,
        "password": TEST_PASSWORD,
        "nombre": "Usuario Test",
        "empresa": "Empresa Test"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    print_response(response, "Crear Usuario")

    # Si el usuario se creó exitosamente, usamos sus credenciales
    # Si no, usamos las credenciales por defecto
    login_email = new_email if response.status_code in [200, 201] else TEST_EMAIL
    login_password = TEST_PASSWORD
    
    print(f"\nIntentando login con: {login_email}")
    
    # Login
    login_data = {
        "username": login_email,
        "password": login_password,
        "grant_type": "password"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/token",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token_data = print_response(response, "Login Usuario")
    
    if token_data and 'access_token' in token_data:
        headers["Authorization"] = f"Bearer {token_data['access_token']}"
        return True
    
    # Si el primer intento falla, intentar con credenciales alternativas
    if response.status_code == 401:
        print("\nIntentando login con credenciales alternativas...")
        alt_login_data = {
            "username": "test@example.com",
            "password": "test123",
            "grant_type": "password"
        }
        response = requests.post(
            f"{BASE_URL}/auth/token",
            data=alt_login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        token_data = print_response(response, "Login Usuario (segundo intento)")
        
        if token_data and 'access_token' in token_data:
            headers["Authorization"] = f"Bearer {token_data['access_token']}"
            return True
    
    return False

# 2. Pruebas de Auditoría Básica
def test_auditoria_basica():
    print("\n🔹 PROBANDO ENDPOINTS DE AUDITORÍA BÁSICA 🔹")
    
    auditoria_data = {
        "nombre_empresa": "Empresa Test",
        "sector": "Agrícola",
        "tamano_instalacion": 1000.0,
        "num_empleados": 50,
        "consumo_anual": 120000.0,
        "factura_mensual": 5000.0,
        "tiene_auditoria_previa": False,
        "fuentes_energia": ["electricidad", "gas_natural"],
        "datos_equipos": {
            "iluminacion_potencia": 5000.0,
            "iluminacion_horas_uso": 3000.0,
            "climatizacion_potencia": 10000.0,
            "climatizacion_horas_uso": 2000.0
        },
        "notas": "Prueba de auditoría básica"
    }
    
    # Crear auditoría básica
    response = requests.post(
        f"{BASE_URL}/auditoria-basica/",
        headers=headers,
        json=auditoria_data
    )
    auditoria = print_response(response, "Crear Auditoría Básica")
    
    if auditoria and isinstance(auditoria, dict) and 'id' in auditoria:
        # Obtener auditoría específica
        response = requests.get(
            f"{BASE_URL}/auditoria-basica/{auditoria['id']}",
            headers=headers
        )
        print_response(response, "Obtener Auditoría Básica")
    
    # Listar todas las auditorías
    response = requests.get(
        f"{BASE_URL}/auditoria-basica/",
        headers=headers
    )
    print_response(response, "Listar Auditorías Básicas")

# 3. Pruebas de Auditoría Agro
def test_auditoria_agro():
    print("\n🔹 PROBANDO ENDPOINTS DE AUDITORÍA AGRO 🔹")
    
    auditoria_agro_data = {
        "nombre_proyecto": "Proyecto Agrícola Test",
        "ubicacion": "Región Test",
        "area_total": 100.0,
        "tipo_cultivo": "Frutales",
        "consumo_electrico": 50000.0,
        "consumo_combustible": 2000.0,
        "consumo_agua": 10000.0,
        "equipos": {
            "tractores": 2,
            "bombas": 5,
            "sistemas_riego": 1
        },
        "sistemas_riego": {
            "tipo": "Goteo",
            "cobertura": 80.0
        },
        "produccion_anual": 500.0,
        "unidad_produccion": "toneladas",
        "tiene_certificacion": True,
        "tiene_mantenimiento": True,
        "tiene_automatizacion": False,
        "observaciones": "Prueba de auditoría agro",
        "consumo_campo": 20000.0,
        "consumo_planta": 15000.0,
        "consumo_plantel": 5000.0,
        "consumo_faenamiento": 5000.0,
        "consumo_proceso": 3000.0,
        "consumo_distribucion": 2000.0
    }
    
    # Crear auditoría agro
    response = requests.post(
        f"{BASE_URL}/auditoria-agro/",
        headers=headers,
        json=auditoria_agro_data
    )
    auditoria_agro = print_response(response, "Crear Auditoría Agro")
    
    if auditoria_agro and isinstance(auditoria_agro, dict) and 'id' in auditoria_agro:
        # Obtener auditoría agro específica
        response = requests.get(
            f"{BASE_URL}/auditoria-agro/{auditoria_agro['id']}",
            headers=headers
        )
        print_response(response, "Obtener Auditoría Agro")
        
        # Actualizar auditoría agro (usando PUT en lugar de PATCH)
        update_data = {
            "area_total": 120.0,
            "observaciones": "Auditoría actualizada"
        }
        response = requests.put(
            f"{BASE_URL}/auditoria-agro/{auditoria_agro['id']}",
            headers=headers,
            json=update_data
        )
        print_response(response, "Actualizar Auditoría Agro")
    
    # Listar todas las auditorías agro
    response = requests.get(
        f"{BASE_URL}/auditoria-agro/",
        headers=headers
    )
    print_response(response, "Listar Auditorías Agro")

# 4. Pruebas del Panel de Control
def test_panel_control():
    print("\n🔹 PROBANDO ENDPOINTS DEL PANEL DE CONTROL 🔹")
    
    # 4.1 Pruebas de Sectores Industriales
    print("\n=== Pruebas de Sectores Industriales ===")
    sector_data = {
        "nombre": "Sector Test",
        "descripcion": "Descripción del sector de prueba"
    }
    
    # Crear sector
    response = requests.post(
        f"{BASE_URL}/admin/sectores/",
        headers=headers,
        json=sector_data
    )
    sector = print_response(response, "Crear Sector Industrial")
    
    if sector and isinstance(sector, dict) and 'id' in sector:
        sector_id = sector['id']
        
        # Actualizar sector
        update_data = {
            "nombre": "Sector Test Actualizado",
            "descripcion": "Descripción actualizada"
        }
        response = requests.put(
            f"{BASE_URL}/admin/sectores/{sector_id}",
            headers=headers,
            json=update_data
        )
        print_response(response, "Actualizar Sector Industrial")
        
        # 4.2 Pruebas de Benchmarks
        print("\n=== Pruebas de Benchmarks ===")
        benchmark_data = {
            "sector_id": sector_id,
            "consumo_promedio": 100000.0,
            "consumo_optimo": 80000.0,
            "unidad_medida": "kWh/año",
            "año": 2024,
            "fuente": "Estudio de mercado"
        }
        
        # Crear benchmark
        response = requests.post(
            f"{BASE_URL}/admin/benchmarks/",
            headers=headers,
            json=benchmark_data
        )
        print_response(response, "Crear Benchmark")
        
        # Obtener benchmarks por sector
        response = requests.get(
            f"{BASE_URL}/admin/benchmarks/sector/{sector_id}",
            headers=headers
        )
        print_response(response, "Obtener Benchmarks por Sector")
    
    # 4.3 Pruebas de Tipos de Equipos
    print("\n=== Pruebas de Tipos de Equipos ===")
    equipo_data = {
        "nombre": "Equipo Test",
        "categoria": "Iluminación",
        "descripcion": "Equipo de prueba",
        "potencia_tipica": 1000.0,
        "unidad_potencia": "W",
        "eficiencia_tipica": 0.85,
        "vida_util": 10
    }
    
    # Crear tipo de equipo
    response = requests.post(
        f"{BASE_URL}/admin/equipos/",
        headers=headers,
        json=equipo_data
    )
    equipo = print_response(response, "Crear Tipo de Equipo")
    
    if equipo and isinstance(equipo, dict) and 'id' in equipo:
        # Registrar eficiencia
        response = requests.post(
            f"{BASE_URL}/admin/equipos/eficiencia",
            headers=headers,
            params={"equipo_id": equipo['id'], "eficiencia": 0.90}
        )
        print_response(response, "Registrar Eficiencia de Equipo")
    
    # 4.4 Pruebas de Plantillas de Recomendaciones
    print("\n=== Pruebas de Plantillas de Recomendaciones ===")
    plantilla_data = {
        "categoria": "Iluminación",
        "titulo": "Cambio a LED",
        "descripcion": "Reemplazar iluminación actual por tecnología LED",
        "ahorro_estimado_min": 30.0,
        "ahorro_estimado_max": 50.0,
        "costo_implementacion": "Medio",
        "periodo_retorno_tipico": 24.0,
        "prioridad": 2,
        "condiciones_aplicacion": {
            "tipo_actual": "Fluorescente",
            "horas_uso": ">2000"
        }
    }
    
    # Crear plantilla
    response = requests.post(
        f"{BASE_URL}/admin/recomendaciones/",
        headers=headers,
        json=plantilla_data
    )
    print_response(response, "Crear Plantilla de Recomendación")
    
    # Filtrar por categoría
    response = requests.get(
        f"{BASE_URL}/admin/recomendaciones/categoria/Iluminación",
        headers=headers
    )
    print_response(response, "Filtrar Recomendaciones por Categoría")
    
    # 4.5 Pruebas de Exportación
    print("\n=== Pruebas de Exportación ===")
    
    # Exportar auditorías
    response = requests.get(
        f"{BASE_URL}/admin/exportar/auditorias",
        headers=headers
    )
    print_response(response, "Exportar Auditorías")
    
    # Exportar estadísticas
    response = requests.get(
        f"{BASE_URL}/admin/exportar/estadisticas",
        headers=headers
    )
    print_response(response, "Exportar Estadísticas")

def main():
    print("🚀 INICIANDO PRUEBAS DE LA API 🚀")
    
    try:
        # Verificar que la API esté funcionando
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("❌ Error: La API no está respondiendo correctamente")
            print(f"Status Code: {response.status_code}")
            return
            
        print("✅ API funcionando correctamente")
        print("Endpoints disponibles:", response.json())
        
        # Primero autenticamos
        if not test_user_endpoints():
            print("❌ Error en la autenticación. Deteniendo pruebas.")
            return
        
        # Luego ejecutamos las demás pruebas
        test_auditoria_basica()
        test_auditoria_agro()
        test_panel_control()  # Agregamos las pruebas del panel de control
        
        print("\n✅ PRUEBAS COMPLETADAS ✅")
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: No se pudo conectar con la API. Asegúrate de que el servidor esté corriendo en", BASE_URL)
    except Exception as e:
        print("\n❌ Error inesperado:", str(e))

if __name__ == "__main__":
    main() 