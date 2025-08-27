import os

# Usar el puerto dinámico asignado por DigitalOcean App Platform
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# Configuración de workers
workers = 2
worker_class = "uvicorn.workers.UvicornWorker"

# Configuración de timeout
timeout = 120

# Otras configuraciones recomendadas
keepalive = 5
worker_tmp_dir = "/dev/shm"