# 🐳 AUDITE - STACK COMPLETO CON DOCKER

## 🎯 **¿QUÉ ES ESTO?**

Una configuración **completa** que levanta todo el ecosistema AuditE con **un solo comando**:

- 🐘 **PostgreSQL** - Base de datos productiva
- 🐍 **Backend FastAPI** - API con hot-reload
- ⚛️ **Frontend React** - Interfaz con hot-reload  
- 🌐 **Adminer** - Gestor web de base de datos
- 🔗 **Redis** - Cache (opcional)

---

## 🚀 **INICIO RÁPIDO (1 COMANDO)**

```bash
# Desde el directorio audite/
make docker-full
```

**¡Eso es todo!** 🎉

---

## 📋 **REQUISITOS PREVIOS**

### ✅ **Solo necesitas:**
- **Docker Desktop** - [Descargar aquí](https://docker.com/products/docker-desktop)
- **Make** (incluido en macOS/Linux)

### 🔍 **Verificar instalación:**
```bash
docker --version     # Debe mostrar versión
docker-compose --version
make --version
```

---

## 🎮 **COMANDOS PRINCIPALES**

### 🚀 **Levantar todo:**
```bash
# Opción 1: Con logs visibles (recomendado primera vez)
make docker-full

# Opción 2: En background
make docker-full-bg

# Opción 3: Script directo
./start_full_stack.sh
```

### 🛑 **Detener todo:**
```bash
make docker-stop
```

### 📊 **Ver estado:**
```bash
make docker-status
```

### 📋 **Ver logs:**
```bash
# Todos los servicios
make docker-logs

# Solo backend
make docker-logs-backend

# Solo frontend  
make docker-logs-frontend

# Solo base de datos
make docker-logs-db
```

### 🔄 **Reiniciar servicios:**
```bash
# Reiniciar backend
make docker-restart-backend

# Reiniciar frontend
make docker-restart-frontend
```

### 🧹 **Limpiar:**
```bash
# Detener y limpiar contenedores
make docker-clean

# Construir imágenes desde cero
make docker-build
```

---

## 🌐 **URLs DISPONIBLES**

Una vez iniciado el stack:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **🏠 Frontend** | `http://localhost:8080` | Aplicación principal |
| **🔧 Backend API** | `http://localhost:8000` | API FastAPI |
| **📚 API Docs** | `http://localhost:8000/docs` | Swagger UI |
| **🗄️ Adminer** | `http://localhost:8081` | Gestor de BD |
| **❤️ Health Check** | `http://localhost:8000/health` | Estado del sistema |

---

## 🔐 **CREDENCIALES**

### **Panel Administrativo:**
- **URL:** `http://localhost:8080/admin`
- **Usuario:** `admin_audite`  
- **Contraseña:** `AuditE2024!SecureAdmin#2024`

### **Base de Datos (Adminer):**
- **Servidor:** `db`
- **Usuario:** `audite_user`
- **Contraseña:** `audite_password_2024`
- **Base de datos:** `audite_dev`

---

## 🔄 **FLUJO DE DESARROLLO**

### **Día a día:**
```bash
# 1. Levantar stack
make docker-full-bg

# 2. Verificar que todo esté corriendo
make docker-status

# 3. Desarrollar (los cambios se reflejan automáticamente)
# - Backend: hot-reload activado
# - Frontend: hot-reload activado

# 4. Ver logs si algo falla
make docker-logs

# 5. Al terminar el día
make docker-stop
```

### **Desarrollo con hot-reload:**
- ✅ **Backend:** Cambios en `audite/app/` se reflejan automáticamente
- ✅ **Frontend:** Cambios en `audite-frontend-explorer/src/` se reflejan automáticamente
- ✅ **Base de datos:** Persistente entre reinicios

---

## 🛠️ **ARQUITECTURA DOCKER**

### **Servicios:**
```yaml
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   React:8080    │◄──►│   FastAPI:8000  │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│    Adminer      │    │   PostgreSQL    │
│   Web:8081      │◄──►│   DB:5432       │
└─────────────────┘    └─────────────────┘
```

### **Volúmenes:**
- 📊 **postgres_data_full** - Datos de PostgreSQL (persistente)
- 📁 **Source code** - Montado para hot-reload
- 🔄 **redis_data_full** - Cache Redis (persistente)

---

## 🐛 **RESOLUCIÓN DE PROBLEMAS**

### **Error: Docker no está corriendo**
```bash
# Iniciar Docker Desktop
open -a Docker  # macOS
# o abrir Docker Desktop manualmente
```

### **Error: Puerto ocupado**
```bash
# Ver qué proceso usa el puerto
lsof -i :8080  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# Detener servicios conflictivos
make docker-stop
```

### **Error: Imagen no se construye**
```bash
# Limpiar y reconstruir
make docker-clean
make docker-build
make docker-full
```

### **Error: Base de datos no conecta**
```bash
# Ver logs de PostgreSQL
make docker-logs-db

# Reiniciar solo la base de datos
docker-compose -f docker-compose.full.yml restart db
```

### **Frontend no carga**
```bash
# Ver logs del frontend
make docker-logs-frontend

# Verificar que el backend esté funcionando
curl http://localhost:8000/health
```

### **Backend no responde**
```bash
# Ver logs del backend
make docker-logs-backend

# Verificar conexión a BD
curl http://localhost:8000/health
```

---

## 🔧 **PERSONALIZACIÓN**

### **Cambiar puertos:**
Editar `docker-compose.full.yml`:
```yaml
ports:
  - "3000:8080"  # Frontend en puerto 3000
  - "8001:8000"  # Backend en puerto 8001
```

### **Agregar variables de entorno:**
Editar `docker-compose.full.yml` en la sección `environment` de cada servicio.

### **Cambiar versión de Node/Python:**
Editar `Dockerfile.dev` en cada directorio.

---

## 📊 **MONITOREO**

### **Ver recursos utilizados:**
```bash
# Uso de recursos por contenedor
docker stats

# Espacio usado por volúmenes
docker system df

# Logs de un contenedor específico
docker logs audite_backend_full -f
```

### **Health checks:**
```bash
# Estado general del sistema
curl http://localhost:8000/health

# Estado de servicios individuales
make docker-status
```

---

## 🎯 **VENTAJAS DE ESTA CONFIGURACIÓN**

### ✅ **Para Desarrollo:**
- **Un solo comando** para levantar todo
- **Hot-reload** en backend y frontend
- **Base de datos persistente** 
- **Adminer** para gestionar BD visualmente
- **Logs centralizados**

### ✅ **Para Testing:**
- **Ambiente aislado** 
- **Fácil reset** con `make docker-clean`
- **Reproducible** en cualquier máquina
- **Misma configuración** que producción

### ✅ **Para Producción:**
- **PostgreSQL** como en producción
- **Variables de entorno** configurables
- **Health checks** implementados
- **Escalable** fácilmente

---

## 🚀 **PRÓXIMOS PASOS**

1. **✅ Levantar stack:** `make docker-full`
2. **🌐 Abrir frontend:** `http://localhost:8080`
3. **🔐 Login admin:** `http://localhost:8080/admin`
4. **📊 Ver API docs:** `http://localhost:8000/docs`
5. **🗄️ Gestionar BD:** `http://localhost:8081`

---

## 📞 **SOPORTE RÁPIDO**

```bash
# Comando de diagnóstico completo
make docker-status && echo "---" && make status
```

Si tienes problemas:
1. **Ver logs:** `make docker-logs`
2. **Reiniciar todo:** `make docker-stop && make docker-full`
3. **Limpiar y empezar:** `make docker-clean && make docker-full`

---

**¡Disfruta desarrollando con AuditE! 🎉** 