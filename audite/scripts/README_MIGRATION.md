# 🚀 SCRIPTS DE MIGRACIÓN - SISTEMA TRADICIONAL → AVANZADO

Este directorio contiene todos los scripts necesarios para migrar el sistema de autodiagnóstico tradicional al sistema avanzado de formularios por industria.

## 📋 DESCRIPCIÓN GENERAL

### Problema
El proyecto tiene dos sistemas de formularios duplicados:
- **Sistema Tradicional:** Autodiagnóstico simple sin lógica condicional
- **Sistema Avanzado:** Formularios por industria con lógica condicional completa

### Solución
Migrar todo al sistema avanzado, eliminando duplicación y unificando la arquitectura.

---

## 📁 ARCHIVOS DE MIGRACIÓN

### 🔍 Scripts de Verificación
| Archivo | Propósito | Uso |
|---------|-----------|-----|
| `verificar_estado_migracion.py` | Analiza estado actual de ambos sistemas | `python verificar_estado_migracion.py` |

### ⚙️ Scripts de Preparación
| Archivo | Propósito | Uso |
|---------|-----------|-----|
| `migration_phase1_setup.sql` | Prepara estructura BD para migración | Ejecutado automáticamente |

### 🔄 Scripts de Migración
| Archivo | Propósito | Uso |
|---------|-----------|-----|
| `migrate_autodiagnostico_to_formularios.py` | Migra datos del sistema tradicional | `python migrate_autodiagnostico_to_formularios.py` |

### 🎯 Scripts de Orquestación
| Archivo | Propósito | Uso |
|---------|-----------|-----|
| `run_migration_complete.py` | Ejecuta todo el proceso automáticamente | `python run_migration_complete.py` |

---

## 🚦 GUÍA DE USO

### Opción 1: Proceso Automático (Recomendado)
```bash
# 1. Verificar estado actual
python scripts/verificar_estado_migracion.py

# 2. Ejecutar migración completa automática
python scripts/run_migration_complete.py

# 3. Con opciones adicionales
python scripts/run_migration_complete.py --dry-run    # Simulación
python scripts/run_migration_complete.py --force      # Forzar si hay errores menores
python scripts/run_migration_complete.py --interactive # Modo interactivo
```

### Opción 2: Proceso Manual (Paso a paso)
```bash
# 1. Verificar estado
python scripts/verificar_estado_migracion.py

# 2. Preparar estructura (si necesario)
psql -d audite -f scripts/migration_phase1_setup.sql

# 3. Ejecutar migración de datos
python scripts/migrate_autodiagnostico_to_formularios.py

# 4. Verificar resultado
python scripts/verificar_estado_migracion.py
```

---

## 📊 FASES DE LA MIGRACIÓN

### FASE 1: PREPARACIÓN (2-3 min)
- ✅ Crear categoría "General"
- ✅ Crear formulario "Autodiagnóstico Energético Básico"
- ✅ Preparar tablas temporales de migración

### FASE 2: MIGRACIÓN DE DATOS (5-10 min)
- ✅ Migrar preguntas tradicionales → preguntas formulario
- ✅ Convertir opciones tradicionales → formato JSON
- ✅ Migrar respuestas manteniendo session_ids
- ✅ Mapear IDs antiguos → nuevos

### FASE 3: ACTUALIZACIÓN APIS (Manual)
- 📝 Deprecar endpoints `/autodiagnostico/*`
- 📝 Actualizar dashboard de estadísticas
- 📝 Integrar métricas unificadas

### FASE 4: VALIDACIÓN (1-2 min)
- ✅ Verificar integridad de datos migrados
- ✅ Confirmar funcionamiento de sistema unificado
- ✅ Validar estadísticas correctas

### FASE 5: LIMPIEZA (1 min)
- 🧹 Eliminar tablas temporales
- 🧹 Archivar datos de backup
- 🧹 Limpiar archivos temporales

---

## 🔍 EJEMPLOS DE EJECUCIÓN

### Verificación Inicial
```bash
$ python scripts/verificar_estado_migracion.py

==================================================================
🔍 REPORTE COMPLETO DEL ESTADO DEL SISTEMA
📅 Fecha: 2025-01-17 15:30:00
==================================================================

📊 SISTEMA TRADICIONAL (Autodiagnóstico)
------------------------------------------------
┌─────────────────────────┬──────────┐
│ Métrica                 │ Valor    │
├─────────────────────────┼──────────┤
│ Preguntas Total         │ 12       │
│ Preguntas Activas       │ 10       │
│ Opciones Total          │ 48       │
│ Respuestas Total        │ 245      │
│ Sesiones Únicas         │ 67       │
└─────────────────────────┴──────────┘

✅ TODOS LOS PREREQUISITOS CUMPLIDOS - LISTO PARA MIGRAR
```

### Ejecución Migración
```bash
$ python scripts/run_migration_complete.py

🚀 MIGRACIÓN COMPLETA: SISTEMA TRADICIONAL → AVANZADO
============================================================
📅 Iniciado: 2025-01-17 15:35:00
📝 Log file: migration_complete_20250117_153500.log
🔧 Modo: EJECUCIÓN REAL
------------------------------------------------------------

[15:35:01] INFO: 🔍 Verificando prerequisitos...
[15:35:02] INFO: 📋 FASE 1: PREPARACIÓN DE ESTRUCTURA
[15:35:03] INFO: ✅ Fase 1 completada: Estructura preparada
[15:35:04] INFO: 🔄 FASE 2: MIGRACIÓN DE DATOS
[15:35:07] INFO: ✅ Migrada pregunta 1 → 15: '¿Cuál es el consumo mensual...'
[15:35:08] INFO: ✅ Migrada pregunta 2 → 16: '¿Qué tipo de equipos...'
...
[15:35:15] INFO: ✅ Fase 2 completada: Datos migrados
[15:35:16] INFO: 🔍 FASE 4: VALIDACIÓN
[15:35:17] INFO: ✅ Fase 4 completada: Validación exitosa

🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE
⏱️ Duración total: 0:00:42
📋 Próximos pasos manuales:
   1. Actualizar componentes frontend admin
   2. Deprecar endpoints tradicionales
   3. Probar funcionalidad completa
   4. Proceder con frontend público
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Antes de Ejecutar
1. **🔒 Hacer backup completo de la base de datos**
2. **🛑 Detener servicios en producción** (si aplica)
3. **👥 Notificar a usuarios** sobre mantenimiento programado
4. **🧪 Probar en entorno de desarrollo** primero

### Durante la Ejecución
- ⏱️ **La migración toma 10-15 minutos** aproximadamente
- 💾 **Se crean backups automáticos** de datos críticos
- 📝 **Logs detallados** se guardan para auditoría
- 🔄 **Proceso es recuperable** en caso de falla

### Después de la Migración
- ✅ **Verificar funcionalidad** en panel admin
- 🧪 **Probar creación** de nuevas preguntas
- 📊 **Revisar estadísticas** unificadas
- 🗑️ **Limpiar datos obsoletos** si todo funciona

---

## 🚨 RESOLUCIÓN DE PROBLEMAS

### Error: "Categoría 'General' no encontrada"
```bash
# Ejecutar preparación manualmente
psql -d audite -f scripts/migration_phase1_setup.sql
```

### Error: "Prerequisitos no cumplidos"
```bash
# Usar forzado (solo si conoces el problema)
python scripts/run_migration_complete.py --force
```

### Error: "Script de migración falló"
```bash
# Ejecutar en modo simulación para diagnosticar
python scripts/run_migration_complete.py --dry-run
```

### Error: "Base de datos bloqueada"
```bash
# Verificar conexiones activas
SELECT * FROM pg_stat_activity WHERE datname = 'audite';
# Terminar conexiones si necesario
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'audite' AND pid != pg_backend_pid();
```

---

## 🗃️ ESTRUCTURA DE ARCHIVOS GENERADOS

```
scripts/
├── migration_logs/
│   ├── migration_complete_20250117_153500.log
│   ├── migration_20250117_153500.log
│   └── reporte_estado_20250117_153000.json
├── backups/
│   ├── rollback_info_20250117_153500.json
│   └── migration_backup_autodiagnostico (tabla BD)
└── temp/
    ├── temp_pregunta_mapping (tabla BD)
    └── temp_migration_stats (tabla BD)
```

---

## 📞 SOPORTE

### En caso de problemas:
1. **📝 Revisar logs** generados
2. **🔍 Verificar estado** con script de verificación  
3. **🔄 Usar información de rollback** si es necesario
4. **👨‍💻 Contactar desarrollador** con logs y detalles

### Información de rollback:
- Todos los cambios tienen **backup automático**
- **Mapeo de IDs** preservado en tablas temporales
- **Scripts de reversión** disponibles si necesario

---

## ✅ CHECKLIST DE MIGRACIÓN

### Pre-Migración
- [ ] Backup completo de base de datos
- [ ] Verificar estado actual del sistema
- [ ] Probar en entorno de desarrollo
- [ ] Notificar stakeholders

### Durante Migración
- [ ] Ejecutar scripts en orden correcto
- [ ] Monitorear logs en tiempo real
- [ ] Verificar que no hay errores críticos

### Post-Migración
- [ ] Validar integridad de datos
- [ ] Probar funcionalidad admin
- [ ] Actualizar componentes frontend
- [ ] Deprecar código obsoleto
- [ ] Documentar cambios realizados

---

**🎯 Una vez completada la migración, el sistema estará 100% unificado y listo para el desarrollo del frontend público.**