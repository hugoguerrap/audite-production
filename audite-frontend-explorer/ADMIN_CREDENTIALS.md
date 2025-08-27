# Credenciales de Administrador - AuditE

## Acceso al Panel de Administración

**URL:** `https://tu-dominio.com/admin`

### Credenciales Seguras:
- **Usuario:** `audite_admin`
- **Contraseña:** `AuditE2024!Secure#Admin`

## Características de Seguridad Implementadas:

### 1. **Límite de Intentos Fallidos**
- Máximo 3 intentos fallidos
- Después de 3 intentos incorrectos, el acceso se bloquea por 5 minutos
- Contador de intentos restantes mostrado en cada fallo

### 2. **Bloqueo Temporal**
- Bloqueo automático por 5 minutos tras 3 intentos fallidos
- Tiempo restante mostrado en pantalla
- Limpieza automática del bloqueo al expirar

### 3. **Persistencia de Seguridad**
- Los intentos fallidos se guardan en localStorage
- El bloqueo persiste aunque se recargue la página
- Limpieza automática tras login exitoso

## IMPORTANTE:

⚠️ **ELIMINA ESTE ARCHIVO DESPUÉS DE ANOTAR LAS CREDENCIALES EN UN LUGAR SEGURO**

⚠️ **NO COMPARTAS ESTAS CREDENCIALES POR EMAIL O CHAT**

⚠️ **CAMBIA LAS CREDENCIALES PERIÓDICAMENTE**

## Para cambiar las credenciales en el futuro:

1. Edita el archivo: `src/pages/Admin/AdminLogin.tsx`
2. Modifica el objeto `DEFAULT_ADMIN` con las nuevas credenciales
3. Despliega la nueva versión

## Recomendaciones adicionales:

- Usar un gestor de contraseñas
- Cambiar credenciales cada 3-6 meses
- No acceder desde redes públicas
- Cerrar sesión después de usar el panel 