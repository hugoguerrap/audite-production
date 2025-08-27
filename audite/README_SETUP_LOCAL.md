# 🚀 AUDITE - CONFIGURACIÓN LOCAL

## 📋 **REQUISITOS PREVIOS**

### 🔧 **Software Requerido:**
- **Python 3.8+** - [Descargar](https://python.org)
- **Node.js 16+** - [Descargar](https://nodejs.org)
- **Docker** (opcional para PostgreSQL) - [Descargar](https://docker.com)

### ✅ **Verificar Instalación:**
```bash
python3 --version  # >= 3.8
node --version     # >= 16
docker --version   # Opcional
```

---

## 🎯 **OPCIÓN 1: CONFIGURACIÓN RÁPIDA (SQLite)**

### **Para desarrollo rápido y simple:**

```bash
# 1. Clonar y entrar al directorio
cd audite_complete/audite

# 2. Configuración automática
make setup-sqlite

# 3. Iniciar backend
make dev
```

### **En otra terminal - Frontend:**
```bash
cd audite_complete/audite-frontend-explorer
npm install
npm run dev
```

**✅ Listo! Accede a:** `http://localhost:8080`

---

## 🐘 **OPCIÓN 2: CONFIGURACIÓN PRODUCTIVA (PostgreSQL)**

### **Para replicar ambiente de producción:**

```bash
# 1. Verificar Docker
docker --version

# 2. Configuración automática con PostgreSQL
cd audite_complete/audite
make setup-postgres

# 3. Iniciar backend
make dev
```

### **En otra terminal - Frontend:**
```bash
cd audite_complete/audite-frontend-explorer
npm install
npm run dev
```

**✅ URLs disponibles:**
- **Frontend:** `http://localhost:8080`
- **Backend API:** `http://localhost:8000`
- **Admin Panel:** `http://localhost:8080/admin`
- **Adminer (DB):** `http://localhost:8081`

---

## 🔧 **CONFIGURACIÓN MANUAL PASO A PASO**

### **1. Backend (FastAPI + PostgreSQL):**

```bash
cd audite

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# o
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Iniciar PostgreSQL (Docker)
docker-compose -f docker-compose.dev.yml up -d db

# Configurar variables de entorno
cp .env.dev .env

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **2. Frontend (React + TypeScript):**

```bash
cd audite-frontend-explorer

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

---

## 📊 **COMANDOS ÚTILES**

### **Makefile (Backend):**
```bash
make help           # Ver todos los comandos
make status         # Ver estado del sistema
make start-db       # Solo iniciar PostgreSQL
make stop-db        # Detener PostgreSQL
make migrate        # Ejecutar migraciones
make reset-db       # Resetear base de datos
make logs           # Ver logs de PostgreSQL
make clean          # Limpiar archivos temporales
```

### **Gestión de Base de Datos:**
```bash
# Ver tablas (SQLite)
sqlite3 audite.db ".tables"

# Conectar a PostgreSQL
docker exec -it audite_postgres_dev psql -U audite_user -d audite_dev

# Adminer (interfaz web)
# http://localhost:8081
# Servidor: db
# Usuario: audite_user
# Contraseña: audite_password_2024
# Base de datos: audite_dev
```

---

## 🔐 **CREDENCIALES DE ADMIN**

### **Panel Administrativo:**
- **URL:** `http://localhost:8080/admin`
- **Usuario:** `admin_audite`
- **Contraseña:** `AuditE2024!SecureAdmin#2024`

---

## 🐛 **RESOLUCIÓN DE PROBLEMAS**

### **Error: Puerto ocupado**
```bash
# Verificar qué proceso usa el puerto
lsof -i :8000  # Backend
lsof -i :8080  # Frontend
lsof -i :5432  # PostgreSQL

# Matar proceso si es necesario
kill -9 <PID>
```

### **Error: Docker no responde**
```bash
# Reiniciar contenedores
make stop-db
make start-db

# Ver logs
make logs
```

### **Error: Migraciones**
```bash
# Resetear migraciones
make reset-db

# O manual:
alembic downgrade base
alembic upgrade head
```

### **Error: CORS**
```bash
# Verificar configuración en .env
grep CORS_ORIGINS .env

# Debe incluir:
# CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

---

## 🔄 **FLUJO DE DESARROLLO**

### **Día a día:**
```bash
# 1. Iniciar PostgreSQL
make start-db

# 2. Activar entorno virtual
source venv/bin/activate

# 3. Iniciar backend
make dev

# 4. En otra terminal - frontend
cd ../audite-frontend-explorer
npm run dev
```

### **Agregar nuevos modelos:**
```bash
# 1. Modificar app/models.py
# 2. Crear migración
alembic revision --autogenerate -m "Descripción"
# 3. Aplicar migración
alembic upgrade head
```

### **Resetear todo:**
```bash
make clean-all    # Limpia Docker, venv, etc.
make setup-postgres  # Reconfigura desde cero
```

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
audite_complete/
├── audite/                 # Backend (FastAPI)
│   ├── app/
│   │   ├── main.py        # Aplicación principal
│   │   ├── models.py      # Modelos SQLAlchemy
│   │   ├── routers/       # Endpoints API
│   │   └── database.py    # Configuración BD
│   ├── alembic/           # Migraciones
│   ├── scripts/           # Scripts de setup
│   ├── .env               # Variables de entorno
│   ├── .env.dev           # Config PostgreSQL
│   ├── docker-compose.dev.yml
│   └── Makefile
└── audite-frontend-explorer/  # Frontend (React)
    ├── src/
    │   ├── pages/         # Páginas principales
    │   ├── components/    # Componentes UI
    │   ├── hooks/         # Custom hooks
    │   └── config/        # Configuración API
    └── package.json
```

---

## 🎯 **PRÓXIMOS PASOS**

1. **✅ Configurar ambiente** (SQLite o PostgreSQL)
2. **✅ Acceder al admin:** `http://localhost:8080/admin`
3. **✅ Probar autodiagnóstico:** `http://localhost:8080/diagnostico`
4. **🔧 Desarrollar nuevas funcionalidades** siguiendo el plan

---

## 📞 **SOPORTE**

Si encuentras problemas:

1. **Verificar estado:** `make status`
2. **Ver logs:** `make logs`
3. **Resetear:** `make reset-db`
4. **Limpiar todo:** `make clean-all` y volver a configurar 