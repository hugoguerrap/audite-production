#!/bin/bash

# Crear directorios si no existen
mkdir -p nginx/conf.d
mkdir -p nginx/certs

# Generar certificados SSL autofirmados
cd nginx/certs

# Generar certificado y clave privada
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt \
-subj "/C=ES/ST=State/L=City/O=Organization/OU=IT/CN=localhost"

# Establecer permisos adecuados
chmod 644 server.crt
chmod 600 server.key

echo "Certificados SSL generados en nginx/certs/"
ls -la

cd ../../
echo "Configuración completada. Ahora puedes construir tu Docker image." 