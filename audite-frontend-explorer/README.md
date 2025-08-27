# Audite Frontend Explorer

## Configuración del Proyecto

### Configuración de SSL para desarrollo

1. Ejecuta el script para generar certificados SSL autofirmados:

```bash
# Dar permisos de ejecución al script
chmod +x generate-certificates.sh

# Ejecutar el script
./generate-certificates.sh
```

2. Construye la imagen Docker:

```bash
docker build -t audite-frontend .
```

3. Ejecuta el contenedor:

```bash
docker run -p 80:80 -p 443:443 audite-frontend
```

### Configuración en el Servidor de Producción

1. Clona el repositorio en tu servidor:
```bash
git clone <url-repositorio>
cd audite-frontend-explorer
```

2. Para producción, se recomienda usar certificados reales:
   - Utiliza Let's Encrypt para generar certificados gratuitos.
   - Actualiza la configuración de Nginx para usar esos certificados.

Ejemplo de configuración con certbot (Let's Encrypt):
```bash
# Instalar certbot
apt-get update
apt-get install certbot

# Obtener certificados (reemplaza example.com con tu dominio)
certbot certonly --standalone -d example.com -d www.example.com

# Copiar los certificados a la carpeta nginx/certs
mkdir -p nginx/certs
cp /etc/letsencrypt/live/example.com/fullchain.pem nginx/certs/server.crt
cp /etc/letsencrypt/live/example.com/privkey.pem nginx/certs/server.key
```

3. Actualiza el archivo nginx/conf.d/default.conf para usar tu dominio real en lugar de localhost.

4. Construye y ejecuta el contenedor Docker:
```bash
docker build -t audite-frontend .
docker run -d -p 80:80 -p 443:443 --name audite-app audite-frontend
```

## Project info

**URL**: https://lovable.dev/projects/7c91b859-73dd-4391-a92a-fc3c9610652d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7c91b859-73dd-4391-a92a-fc3c9610652d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?
