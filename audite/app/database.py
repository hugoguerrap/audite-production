from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Obtener la URL de la base de datos desde variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL")

# Si no hay URL definida, determinar por entorno
if not DATABASE_URL:
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "production":
        raise ValueError("❌ DATABASE_URL es obligatoria en producción")
    elif environment == "development":
        print("🔧 Entorno de desarrollo detectado")
        # Preferir PostgreSQL en desarrollo también
        if os.getenv("USE_POSTGRES_DEV", "true").lower() == "true":
            DATABASE_URL = "postgresql://audite_user:audite_password_2024@db:5432/audite"
            print("🐘 Usando PostgreSQL para desarrollo (recomendado)")
        else:
            DATABASE_URL = "sqlite:///./audite.db"
            print("⚠️  Usando SQLite para desarrollo (puede causar inconsistencias)")
    else:
        DATABASE_URL = "sqlite:///./audite.db"
        print("⚠️  Entorno desconocido, usando SQLite por defecto")
else:
    db_type = "PostgreSQL" if DATABASE_URL.startswith("postgresql") else "SQLite" if DATABASE_URL.startswith("sqlite") else "Otra BD"
    print(f"✅ Usando {db_type}: {DATABASE_URL.split('@')[0] if '@' in DATABASE_URL else 'archivo local'}@***")

# Configuración específica según el tipo de base de datos
if DATABASE_URL.startswith("sqlite"):
    # Configuración para SQLite
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=os.getenv("ENVIRONMENT") == "development"
    )
    print("🗄️  Configuración SQLite aplicada")
elif DATABASE_URL.startswith("postgresql"):
    # Configuración para PostgreSQL
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=os.getenv("ENVIRONMENT") == "development"
    )
    print("🐘 Configuración PostgreSQL aplicada")
else:
    # Configuración genérica
    engine = create_engine(DATABASE_URL)
    print("⚙️  Configuración genérica aplicada")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para verificar conexión
def test_connection():
    """Prueba la conexión a la base de datos"""
    try:
        with engine.connect() as connection:
            if DATABASE_URL.startswith("sqlite"):
                result = connection.execute(text("SELECT 1")).fetchone()
            else:
                result = connection.execute(text("SELECT 1 as test")).fetchone()
            
            if result:
                print("✅ Conexión a base de datos exitosa")
                return True
            else:
                print("❌ Error en la conexión a base de datos")
                return False
    except Exception as e:
        print(f"❌ Error conectando a base de datos: {e}")
        return False 