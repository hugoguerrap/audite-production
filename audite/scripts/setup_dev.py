#!/usr/bin/env python3
"""
Script para configurar el entorno de desarrollo de AuditE
Permite elegir entre SQLite (rápido) o PostgreSQL (productivo)
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_header():
    print("🚀 " + "="*50)
    print("   CONFIGURADOR DE ENTORNO - AUDITE")
    print("="*52)
    print()

def check_docker():
    """Verifica si Docker está disponible"""
    try:
        result = subprocess.run(['docker', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Docker disponible:", result.stdout.strip())
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Docker no está instalado o no está en PATH")
    return False

def setup_sqlite():
    """Configurar entorno con SQLite"""
    print("🗄️  Configurando entorno con SQLite...")
    
    # Copiar .env para SQLite
    if os.path.exists('.env'):
        print("✅ Archivo .env ya existe (SQLite)")
    else:
        print("❌ No se encontró archivo .env")
        return False
    
    # Verificar si existe la base de datos
    if os.path.exists('audite.db'):
        print("✅ Base de datos SQLite encontrada")
    else:
        print("⚠️  No se encontró audite.db, se creará al iniciar")
    
    return True

def setup_postgresql():
    """Configurar entorno con PostgreSQL"""
    print("🐘 Configurando entorno con PostgreSQL...")
    
    if not check_docker():
        print("❌ PostgreSQL requiere Docker. Instala Docker primero.")
        return False
    
    # Copiar configuración de PostgreSQL
    if os.path.exists('.env.dev'):
        shutil.copy('.env.dev', '.env')
        print("✅ Configuración PostgreSQL aplicada (.env.dev → .env)")
    else:
        print("❌ No se encontró .env.dev")
        return False
    
    # Levantar PostgreSQL con Docker
    print("🐳 Iniciando PostgreSQL con Docker...")
    try:
        result = subprocess.run([
            'docker-compose', '-f', 'docker-compose.dev.yml', 'up', '-d', 'db'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ PostgreSQL iniciado correctamente")
            print("🔗 Conexión: "postgresql://[SECRET-REMOVED]"")
            print("🌐 Adminer disponible en: http://localhost:8081")
            return True
        else:
            print("❌ Error iniciando PostgreSQL:")
            print(result.stderr)
            return False
    except FileNotFoundError:
        print("❌ docker-compose no encontrado")
        return False

def install_dependencies():
    """Instalar dependencias de Python"""
    print("📦 Instalando dependencias...")
    
    # Verificar si existe venv
    if not os.path.exists('venv'):
        print("🔧 Creando entorno virtual...")
        subprocess.run([sys.executable, '-m', 'venv', 'venv'])
    
    # Activar venv e instalar dependencias
    if os.name == 'nt':  # Windows
        pip_path = 'venv\\Scripts\\pip'
        python_path = 'venv\\Scripts\\python'
    else:  # Unix/Linux/Mac
        pip_path = 'venv/bin/pip'
        python_path = 'venv/bin/python'
    
    subprocess.run([pip_path, 'install', '-r', 'requirements.txt'])
    print("✅ Dependencias instaladas")
    
    return python_path

def run_migrations(python_path):
    """Ejecutar migraciones de Alembic"""
    print("🔄 Ejecutando migraciones...")
    
    try:
        # Intentar crear migración automática
        result = subprocess.run([
            python_path, '-m', 'alembic', 'revision', '--autogenerate', 
            '-m', 'Initial migration for development'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migración creada")
        
        # Aplicar migraciones
        result = subprocess.run([
            python_path, '-m', 'alembic', 'upgrade', 'head'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migraciones aplicadas")
            return True
        else:
            print("⚠️  Error en migraciones:", result.stderr)
            return False
            
    except Exception as e:
        print(f"⚠️  Error ejecutando migraciones: {e}")
        return False

def main():
    print_header()
    
    print("Selecciona el tipo de base de datos:")
    print("1. 🗄️  SQLite (Rápido, para desarrollo simple)")
    print("2. 🐘 PostgreSQL (Productivo, requiere Docker)")
    print("3. ❌ Salir")
    
    choice = input("\nElige una opción (1-3): ").strip()
    
    if choice == '1':
        if not setup_sqlite():
            return 1
    elif choice == '2':
        if not setup_postgresql():
            return 1
    elif choice == '3':
        print("👋 ¡Hasta luego!")
        return 0
    else:
        print("❌ Opción inválida")
        return 1
    
    # Instalar dependencias
    python_path = install_dependencies()
    
    # Ejecutar migraciones
    run_migrations(python_path)
    
    print("\n🎉 " + "="*50)
    print("   CONFIGURACIÓN COMPLETADA")
    print("="*52)
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. Activar entorno virtual:")
    if os.name == 'nt':
        print("   .\\venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    
    print("2. Iniciar backend:")
    print("   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
    print("3. En otra terminal, iniciar frontend:")
    print("   cd ../audite-frontend-explorer")
    print("   npm run dev")
    
    print("\n🌐 URLs importantes:")
    print("   Frontend: http://localhost:8080")
    print("   Backend API: http://localhost:8000")
    print("   Admin Panel: http://localhost:8080/admin")
    if choice == '2':
        print("   Adminer (DB): http://localhost:8081")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 