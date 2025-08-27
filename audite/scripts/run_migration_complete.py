#!/usr/bin/env python3
"""
EJECUTOR COMPLETO DE MIGRACIÓN
==============================

Script principal que orquestra todo el proceso de migración
del sistema tradicional al sistema avanzado.

Incluye todas las fases:
- Preparación de estructura 
- Migración de datos
- Validación
- Limpieza

Uso:
    python run_migration_complete.py [--dry-run] [--force] [--skip-backup]
"""

import sys
import os
import argparse
import subprocess
from datetime import datetime
from pathlib import Path

# Agregar directorio padre al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.database import DATABASE_URL

class MigrationOrchestrator:
    """Orquestador principal de la migración"""
    
    def __init__(self, dry_run=False, force=False, skip_backup=False):
        self.dry_run = dry_run
        self.force = force
        self.skip_backup = skip_backup
        self.scripts_dir = Path(__file__).parent
        self.log_file = f"migration_complete_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        # Configurar base de datos
        self.engine = create_engine(DATABASE_URL)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        print("🚀 MIGRACIÓN COMPLETA: SISTEMA TRADICIONAL → AVANZADO")
        print("=" * 60)
        print(f"📅 Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📝 Log file: {self.log_file}")
        print(f"🔧 Modo: {'DRY RUN' if dry_run else 'EJECUCIÓN REAL'}")
        print(f"💪 Forzar: {'SÍ' if force else 'NO'}")
        print(f"💾 Backup: {'OMITIR' if skip_backup else 'CREAR'}")
        print("-" * 60)
    
    def log(self, message, level="INFO"):
        """Log con timestamp"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        formatted_message = f"[{timestamp}] {level}: {message}"
        print(formatted_message)
        
        # También escribir a archivo
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(f"{formatted_message}\n")
    
    def ejecutar_comando(self, comando, descripcion):
        """Ejecuta un comando del sistema"""
        self.log(f"Ejecutando: {descripcion}")
        
        if self.dry_run:
            self.log(f"[DRY RUN] Comando: {comando}", "DEBUG")
            return True
        
        try:
            result = subprocess.run(
                comando, 
                shell=True, 
                capture_output=True, 
                text=True,
                check=True
            )
            
            if result.stdout:
                self.log(f"Output: {result.stdout.strip()}", "DEBUG")
            
            return True
            
        except subprocess.CalledProcessError as e:
            self.log(f"Error ejecutando comando: {e}", "ERROR")
            self.log(f"Stderr: {e.stderr}", "ERROR")
            return False
    
    def ejecutar_sql_script(self, script_path, descripcion):
        """Ejecuta un script SQL"""
        self.log(f"Ejecutando SQL: {descripcion}")
        
        if not os.path.exists(script_path):
            self.log(f"Script no encontrado: {script_path}", "ERROR")
            return False
        
        if self.dry_run:
            self.log(f"[DRY RUN] SQL Script: {script_path}", "DEBUG")
            return True
        
        try:
            # Leer script SQL
            with open(script_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()
            
            # Ejecutar en base de datos
            db = self.SessionLocal()
            try:
                # Ejecutar script completo
                db.execute(text(sql_content))
                db.commit()
                self.log("SQL ejecutado exitosamente")
                return True
                
            except Exception as e:
                db.rollback()
                self.log(f"Error en SQL: {e}", "ERROR")
                return False
            finally:
                db.close()
                
        except Exception as e:
            self.log(f"Error leyendo script SQL: {e}", "ERROR")
            return False
    
    def verificar_prerequisitos(self):
        """Verifica prerequisitos del sistema"""
        self.log("🔍 Verificando prerequisitos...")
        
        # Ejecutar verificador de estado
        verificador_path = self.scripts_dir / "verificar_estado_migracion.py"
        
        if not verificador_path.exists():
            self.log("❌ Script verificador no encontrado", "ERROR")
            return False
        
        comando = f"python {verificador_path}"
        return self.ejecutar_comando(comando, "Verificación de prerequisitos")
    
    def fase1_preparacion(self):
        """FASE 1: Preparación de estructura"""
        self.log("📋 FASE 1: PREPARACIÓN DE ESTRUCTURA")
        print("-" * 40)
        
        # Ejecutar script de preparación SQL
        setup_sql = self.scripts_dir / "migration_phase1_setup.sql"
        
        if not self.ejecutar_sql_script(setup_sql, "Preparación de estructura base"):
            self.log("❌ Falló preparación de estructura", "ERROR")
            return False
        
        self.log("✅ Fase 1 completada: Estructura preparada")
        return True
    
    def fase2_migracion_datos(self):
        """FASE 2: Migración de datos"""
        self.log("🔄 FASE 2: MIGRACIÓN DE DATOS")
        print("-" * 40)
        
        # Ejecutar script de migración principal
        migrador_path = self.scripts_dir / "migrate_autodiagnostico_to_formularios.py"
        
        if not migrador_path.exists():
            self.log("❌ Script de migración no encontrado", "ERROR")
            return False
        
        # Preparar comando con flags
        flags = []
        if self.force:
            flags.append("--force")
        if self.skip_backup:
            flags.append("--skip-backup")
        
        comando = f"python {migrador_path} {' '.join(flags)}"
        
        if not self.ejecutar_comando(comando, "Migración de datos"):
            self.log("❌ Falló migración de datos", "ERROR")
            return False
        
        self.log("✅ Fase 2 completada: Datos migrados")
        return True
    
    def fase3_actualizacion_apis(self):
        """FASE 3: Actualización de APIs y endpoints"""
        self.log("🔌 FASE 3: ACTUALIZACIÓN DE APIS")
        print("-" * 40)
        
        # Esta fase requiere cambios en código que haremos después
        if self.dry_run:
            self.log("[DRY RUN] Actualización de APIs pendiente")
            return True
        
        # Por ahora, solo logging de lo que se necesita hacer
        self.log("📝 APIs a actualizar:")
        self.log("   - Deprecar endpoints /autodiagnostico/*")
        self.log("   - Actualizar estadísticas en dashboard")
        self.log("   - Integrar métricas unificadas")
        
        # TODO: Implementar actualizaciones automáticas de código
        self.log("⚠️ Fase 3: Requiere cambios manuales de código")
        return True
    
    def fase4_validacion(self):
        """FASE 4: Validación completa"""
        self.log("🔍 FASE 4: VALIDACIÓN")
        print("-" * 40)
        
        # Re-ejecutar verificador para validar estado post-migración
        verificador_path = self.scripts_dir / "verificar_estado_migracion.py"
        comando = f"python {verificador_path}"
        
        if not self.ejecutar_comando(comando, "Validación post-migración"):
            self.log("❌ Falló validación", "ERROR")
            return False
        
        self.log("✅ Fase 4 completada: Validación exitosa")
        return True
    
    def fase5_limpieza(self):
        """FASE 5: Limpieza opcional"""
        self.log("🧹 FASE 5: LIMPIEZA")
        print("-" * 40)
        
        if self.dry_run:
            self.log("[DRY RUN] Limpieza pendiente")
            return True
        
        # Ofrecer opciones de limpieza
        self.log("📋 Opciones de limpieza disponibles:")
        self.log("   - Eliminar tablas temporales")
        self.log("   - Archivar datos tradicionales") 
        self.log("   - Limpiar backups antiguos")
        
        respuesta = input("¿Desea proceder con limpieza? (s/N): ").strip().lower()
        if respuesta not in ['s', 'si', 'sí', 'y', 'yes']:
            self.log("Limpieza omitida por usuario")
            return True
        
        try:
            db = self.SessionLocal()
            
            # Limpiar tablas temporales
            db.execute(text("DROP TABLE IF EXISTS temp_pregunta_mapping CASCADE"))
            db.execute(text("DROP TABLE IF EXISTS temp_migration_stats CASCADE"))
            db.execute(text("DROP TABLE IF EXISTS migration_backup_autodiagnostico CASCADE"))
            
            db.commit()
            db.close()
            
            self.log("✅ Limpieza completada")
            return True
            
        except Exception as e:
            self.log(f"⚠️ Error en limpieza: {e}", "WARNING")
            return True  # No es crítico
    
    def ejecutar_migracion_completa(self):
        """Ejecuta el proceso completo de migración"""
        inicio = datetime.now()
        exito_general = True
        
        try:
            self.log("🚀 INICIANDO PROCESO COMPLETO DE MIGRACIÓN")
            
            # Fase 0: Verificación inicial
            if not self.verificar_prerequisitos():
                if not self.force:
                    self.log("❌ Prerequisitos no cumplidos. Use --force para continuar", "ERROR")
                    return False
                else:
                    self.log("⚠️ Prerequisitos no cumplidos, pero continuando con --force", "WARNING")
            
            # Fase 1: Preparación
            if not self.fase1_preparacion():
                exito_general = False
                if not self.force:
                    return False
            
            # Fase 2: Migración de datos
            if not self.fase2_migracion_datos():
                exito_general = False
                if not self.force:
                    return False
            
            # Fase 3: APIs (manual por ahora)
            if not self.fase3_actualizacion_apis():
                self.log("⚠️ Fase 3 requiere intervención manual", "WARNING")
            
            # Fase 4: Validación
            if not self.fase4_validacion():
                exito_general = False
                if not self.force:
                    return False
            
            # Fase 5: Limpieza opcional
            if not self.fase5_limpieza():
                self.log("⚠️ Limpieza tuvo problemas menores", "WARNING")
            
            # Resumen final
            duracion = datetime.now() - inicio
            
            if exito_general:
                self.log("🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE")
                self.log(f"⏱️ Duración total: {duracion}")
                self.log("📋 Próximos pasos manuales:")
                self.log("   1. Actualizar componentes frontend admin")
                self.log("   2. Deprecar endpoints tradicionales")
                self.log("   3. Probar funcionalidad completa")
                self.log("   4. Proceder con frontend público")
                return True
            else:
                self.log("⚠️ MIGRACIÓN COMPLETADA CON ADVERTENCIAS", "WARNING")
                self.log(f"⏱️ Duración total: {duracion}")
                self.log("⚠️ Revisar logs para detalles de problemas")
                return False
                
        except Exception as e:
            self.log(f"💥 Error crítico en migración: {e}", "ERROR")
            return False
    
    def crear_rollback_info(self):
        """Crea información para posible rollback"""
        self.log("💾 Creando información de rollback...")
        
        rollback_info = {
            'timestamp': datetime.now().isoformat(),
            'database_url': DATABASE_URL,
            'backup_tables': [
                'migration_backup_autodiagnostico',
                'temp_pregunta_mapping',
                'temp_migration_stats'
            ],
            'scripts_used': [
                'migration_phase1_setup.sql',
                'migrate_autodiagnostico_to_formularios.py'
            ]
        }
        
        rollback_file = f"rollback_info_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(rollback_file, 'w', encoding='utf-8') as f:
            import json
            json.dump(rollback_info, f, indent=2)
        
        self.log(f"📁 Información de rollback guardada en: {rollback_file}")


def main():
    """Función principal con argumentos de línea de comandos"""
    parser = argparse.ArgumentParser(
        description="Ejecutor completo de migración del sistema tradicional al avanzado"
    )
    
    parser.add_argument(
        '--dry-run', 
        action='store_true', 
        help='Ejecutar en modo simulación (no hace cambios reales)'
    )
    
    parser.add_argument(
        '--force', 
        action='store_true', 
        help='Continuar aunque fallen algunas verificaciones'
    )
    
    parser.add_argument(
        '--skip-backup', 
        action='store_true', 
        help='Omitir creación de backups'
    )
    
    parser.add_argument(
        '--interactive', 
        action='store_true', 
        help='Modo interactivo con confirmaciones'
    )
    
    args = parser.parse_args()
    
    # Confirmación en modo interactivo
    if args.interactive or not (args.dry_run or args.force):
        print("⚠️ ADVERTENCIA: Esta operación modificará la base de datos")
        print("📋 Se recomienda hacer backup antes de proceder")
        print(f"🔧 Modo: {'DRY RUN' if args.dry_run else 'EJECUCIÓN REAL'}")
        
        respuesta = input("\n¿Desea continuar? (s/N): ").strip().lower()
        if respuesta not in ['s', 'si', 'sí', 'y', 'yes']:
            print("❌ Operación cancelada por el usuario")
            return 1
    
    # Ejecutar migración
    orchestrator = MigrationOrchestrator(
        dry_run=args.dry_run,
        force=args.force,
        skip_backup=args.skip_backup
    )
    
    # Crear información de rollback antes de empezar
    orchestrator.crear_rollback_info()
    
    # Ejecutar proceso completo
    success = orchestrator.ejecutar_migracion_completa()
    
    return 0 if success else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n⚠️ Migración interrumpida por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Error inesperado: {e}")
        sys.exit(1)