# Colección de Postman para la API de Audite

Esta carpeta contiene una colección de Postman para consumir todos los endpoints de la API de Audite.

## Instrucciones de uso

1. Descarga e instala [Postman](https://www.postman.com/downloads/) si aún no lo tienes.
2. Abre Postman y haz clic en el botón "Import" en la esquina superior izquierda.
3. Selecciona el archivo `audite_api_collection.json` de esta carpeta.
4. La colección "Audite API Collection" aparecerá en tu lista de colecciones.

## Variables de entorno

La colección utiliza dos variables que debes configurar:

- `base_url`: URL base de la API (por defecto: `http://localhost:8000`)
- `token`: Token de acceso JWT que obtendrás al hacer login

### Configurar variables de entorno

1. Haz clic en el icono de engranaje (⚙️) en la esquina superior derecha.
2. Selecciona "Manage Environments" o "Environments".
3. Haz clic en "Add" para crear un nuevo ambiente.
4. Dale un nombre como "Audite API Environment".
5. Agrega las variables:
   - `base_url` con valor `http://localhost:8000` (o la URL donde esté desplegado el servidor)
   - `token` (déjalo vacío por ahora)
6. Guarda el ambiente y selecciónalo en el desplegable de ambientes.

## Flujo de uso recomendado

1. Usa el endpoint "Login - Obtener Token" con tu email y contraseña.
2. Copia el token JWT recibido en la respuesta.
3. Actualiza la variable de entorno `token` con el valor copiado.
4. Ahora puedes usar cualquier otro endpoint que requiera autenticación.

## Recursos disponibles

La colección está organizada en las siguientes carpetas:

- **Root**: Información general de la API
- **Autenticación**: Registro y login de usuarios
- **Auditoría Básica**: Crear, listar, obtener, actualizar y eliminar auditorías básicas
- **Auditoría Agro**: Crear, listar, obtener, actualizar y eliminar auditorías agrícolas
- **Datos Agrícolas**: Acceso a datos de referencia para el sector agrícola
- **Admin**: Funciones administrativas y exportación de datos 