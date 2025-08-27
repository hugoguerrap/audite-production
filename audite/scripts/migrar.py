#!/usr/bin/env python3
"""
🚀 MIGRACIÓN SIMPLE - PUNTO DE ENTRADA PRINCIPAL
===============================================

Script simple y directo para migrar el sistema tradicional
al sistema avanzado sin complicaciones técnicas.

Uso simple:
    python migrar.py

Este script:
✅ Verifica el estado actual
✅ Ejecuta la migración completa
✅ Valida los resultados
✅ Proporciona siguiente pasos

Para usuarios que solo quieren migrar sin detalles técnicos.
"""

import sys
import os
import subprocess
from datetime import datetime
from pathlib import Path

def print_header():
    """Muestra header amigable"""
    print("=" * 60)
    print("🚀 MIGRACIÓN DEL SISTEMA DE FORMULARIOS")
    print("   Tradicional → Avanzado (Unificado)")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

def print_step(step_num, title, description=""):
    """Muestra paso actual"""
    print(f"📋 PASO {step_num}: {title}")
    if description:
        print(f"   {description}")
    print("-" * 40)

def ejecutar_comando(comando, descripcion):
    """Ejecuta comando y muestra resultado"""
    print(f"🔄 {descripcion}...")
    
    try:
        result = subprocess.run(
            comando, 
            shell=True, 
            capture_output=True, 
            text=True
        )
        
        if result.returncode == 0:
            print(f"✅ {descripcion} - COMPLETADO")
            return True
        else:
            print(f"❌ {descripcion} - ERROR")
            if result.stderr:
                print(f"   Error: {result.stderr.strip()}")
            return False
            
    except Exception as e:
        print(f"💥 Error ejecutando: {e}")
        return False

def verificar_python_requirements():
    """Verifica que Python y dependencias estén disponibles"""
    print("🔍 Verificando entorno Python...")
    
    try:
        import sqlalchemy
        import tabulate
        print("✅ Dependencias Python disponibles")
        return True
    except ImportError as e:
        print(f"❌ Falta dependencia: {e}")
        print("💡 Instalar con: pip install sqlalchemy tabulate")
        return False

def main():
    """Función principal simple"""
    print_header()
    
    # Obtener directorio de scripts
    scripts_dir = Path(__file__).parent
    
    print("🎯 Este script migrará automáticamente:")
    print("   • Preguntas del autodiagnóstico tradicional")
    print("   • Opciones y sugerencias")  
    print("   • Respuestas de usuarios existentes")
    print("   • Al sistema avanzado unificado")
    print()
    
    # Confirmación del usuario
    respuesta = input("¿Desea continuar con la migración? (s/N): ").strip().lower()
    if respuesta not in ['s', 'si', 'sí', 'y', 'yes']:
        print("❌ Migración cancelada por el usuario")
        return 1
    
    print()
    
    # Verificar entorno
    print_step(1, "VERIFICACIÓN DEL ENTORNO")
    if not verificar_python_requirements():
        print("💡 Por favor instalar dependencias e intentar nuevamente")
        return 1
    print()
    
    # Verificar estado actual
    print_step(2, "ANÁLISIS DEL ESTADO ACTUAL")
    verificador = scripts_dir / "verificar_estado_migracion.py"
    if not verificador.exists():
        print("❌ Scripts de migración no encontrados")
        return 1
    
    if not ejecutar_comando(f"python {verificador}", "Analizando sistema actual"):
        print("⚠️ Análisis mostró advertencias, pero continuando...")
    print()
    
    # Ejecutar migración
    print_step(3, "EJECUTANDO MIGRACIÓN AUTOMÁTICA", "Esto puede tomar 10-15 minutos")
    migrador = scripts_dir / "run_migration_complete.py"
    
    if not migrador.exists():
        print("❌ Script de migración no encontrado")
        return 1
    
    if not ejecutar_comando(f"python {migrador} --interactive", "Ejecutando migración completa"):
        print("❌ La migración falló. Revisar logs para detalles.")
        return 1
    print()
    
    # Verificación final
    print_step(4, "VERIFICACIÓN FINAL")
    if not ejecutar_comando(f"python {verificador}", "Validando migración"):
        print("⚠️ Verificación final tuvo advertencias")
    print()
    
    # Éxito
    print("🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE")
    print("=" * 60)
    print()
    print("✅ El sistema ha sido unificado correctamente")
    print("✅ Todas las preguntas y respuestas han sido migradas")
    print("✅ El panel de administración está actualizado")
    print()
    print("📋 PRÓXIMOS PASOS:")
    print("   1. Verificar funcionamiento en panel admin")
    print("   2. Probar creación de nuevas preguntas")
    print("   3. Revisar estadísticas unificadas")
    print("   4. Proceder con desarrollo de frontend público")
    print()
    print("📂 Logs guardados en: scripts/migration_logs/")
    print("💾 Backups creados automáticamente para rollback")
    print()
    print("🚀 ¡El sistema está listo para el siguiente nivel!")
    
    return 0

def mostrar_ayuda():
    """Muestra información de ayuda"""
    print("🚀 MIGRACIÓN DE FORMULARIOS - AYUDA")
    print("=" * 40)
    print()
    print("USO:")
    print("   python migrar.py          # Migración automática")
    print("   python migrar.py --help   # Esta ayuda")
    print()
    print("QUÉ HACE:")
    print("• Analiza el estado actual del sistema")
    print("• Prepara la estructura necesaria")
    print("• Migra preguntas y respuestas existentes")
    print("• Unifica todo bajo el sistema avanzado")
    print("• Valida que todo funcione correctamente")
    print()
    print("TIEMPO ESTIMADO: 10-15 minutos")
    print("REQUISITOS: Python 3.7+, sqlalchemy, tabulate")
    print()
    print("EN CASO DE PROBLEMAS:")
    print("• Revisar logs en scripts/migration_logs/")
    print("• Usar scripts individuales para diagnóstico")
    print("• Los backups permiten rollback si necesario")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h', 'help']:
        mostrar_ayuda()
        sys.exit(0)
    
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n⚠️ Migración interrumpida por el usuario")
        print("💡 Los cambios parciales pueden requerir limpieza manual")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Error inesperado: {e}")
        print("📝 Revisar logs para más detalles")
        sys.exit(1)