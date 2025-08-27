# Usa una imagen base de Python
FROM python:3.10-slim

# Establece variables de entorno para evitar que Python genere archivos .pyc y para que los prints salgan inmediatamente
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo de dependencias
COPY requirements.txt requirements.txt

# Instala las dependencias
# Asegúrate de que psycopg2-binary y gunicorn estén en requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copia el resto del código de la aplicación al directorio de trabajo
COPY . .

# Expone el puerto que será utilizado (usando la variable PORT para compatibilidad con App Platform)
# DigitalOcean asignará un puerto en la variable PORT
ENV PORT=8000
EXPOSE $PORT

# Comando para ejecutar la aplicación
CMD gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT 