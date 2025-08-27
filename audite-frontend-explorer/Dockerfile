# -------------------------------------------------------
# 1) Builder: compila tu aplicación de Node/Vite
# -------------------------------------------------------
    FROM node:18-alpine AS builder
    WORKDIR /app
    
    # Copia solo package.json y package-lock.json
    COPY package*.json ./
    RUN npm ci
    
    # Copia el resto del código fuente
    COPY . .
    
    # Genera el build en /app/dist
    RUN npm run build
    
    # -------------------------------------------------------
    # 2) Runner: nginx sirve los archivos estáticos compilados
    # -------------------------------------------------------
    FROM nginx:stable-alpine
    
    # Copia tu configuración de nginx y certificados
    # (asegúrate de tener dentro de audite-frontend-explorer/ la carpeta nginx/)
    COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
    COPY nginx/certs /etc/nginx/certs
    
    # Copia el build producido en la etapa builder
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    EXPOSE 80 443
    CMD ["nginx", "-g", "daemon off;"]
    