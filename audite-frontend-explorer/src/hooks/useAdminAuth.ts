import { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';

interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface AdminCredentials {
  username: string;
  password: string;
}

const STORAGE_KEYS = {
  TOKEN: 'adminToken',
  USERNAME: 'adminUsername',
  EXPIRES_AT: 'adminExpiresAt',
  FAILED_ATTEMPTS: 'adminFailedAttempts',
  BLOCKED_UNTIL: 'adminBlockedUntil'
};

const MAX_FAILED_ATTEMPTS = 3;
const BLOCK_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si está bloqueado por intentos fallidos
  const isBlocked = (): boolean => {
    const blockedUntil = localStorage.getItem(STORAGE_KEYS.BLOCKED_UNTIL);
    if (!blockedUntil) return false;
    
    const blockedTime = parseInt(blockedUntil);
    const now = Date.now();
    
    if (now < blockedTime) {
      return true;
    } else {
      // El bloqueo ha expirado, limpiar
      localStorage.removeItem(STORAGE_KEYS.BLOCKED_UNTIL);
      localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
      return false;
    }
  };

  // Obtener tiempo restante de bloqueo
  const getBlockTimeRemaining = (): number => {
    const blockedUntil = localStorage.getItem(STORAGE_KEYS.BLOCKED_UNTIL);
    if (!blockedUntil) return 0;
    
    const blockedTime = parseInt(blockedUntil);
    const now = Date.now();
    
    return Math.max(0, Math.ceil((blockedTime - now) / 1000));
  };

  // Verificar si el token actual es válido
  const verifyToken = async (): Promise<boolean> => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    
    if (!token || !expiresAt) {
      return false;
    }

    // Verificar si el token ha expirado
    const now = Date.now();
    const expiration = parseInt(expiresAt);
    
    if (now >= expiration) {
      clearAuthData();
      return false;
    }

    try {
      // Verificar con el servidor
      const response = await fetch(`${API_URL}/admin/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return true;
      } else {
        clearAuthData();
        return false;
      }
    } catch (err) {
      console.error('Error verificando token:', err);
      return false;
    }
  };

  // Limpiar datos de autenticación
  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  };

  // Manejar intentos fallidos
  const handleFailedAttempt = () => {
    const currentAttempts = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0');
    const newAttempts = currentAttempts + 1;
    
    localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, newAttempts.toString());
    
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      const blockUntil = Date.now() + BLOCK_DURATION;
      localStorage.setItem(STORAGE_KEYS.BLOCKED_UNTIL, blockUntil.toString());
    }
  };

  // Limpiar intentos fallidos después de login exitoso
  const clearFailedAttempts = () => {
    localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.BLOCKED_UNTIL);
  };

  // Función de login
  const login = async (credentials: AdminCredentials): Promise<{ success: boolean; error?: string }> => {
    if (isBlocked()) {
      const timeRemaining = getBlockTimeRemaining();
      return {
        success: false,
        error: `Acceso bloqueado. Intenta nuevamente en ${Math.ceil(timeRemaining / 60)} minutos.`
      };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data: AdminLoginResponse = await response.json();
        
        // Calcular tiempo de expiración
        const expiresAt = Date.now() + (data.expires_in * 1000);
        
        // Guardar datos de autenticación
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEYS.USERNAME, credentials.username);
        localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
        
        // Limpiar intentos fallidos
        clearFailedAttempts();
        
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorData = await response.json();
        handleFailedAttempt();
        
        const failedAttempts = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0');
        const remainingAttempts = MAX_FAILED_ATTEMPTS - failedAttempts;
        
        let errorMessage = errorData.detail || 'Credenciales incorrectas';
        
        if (remainingAttempts > 0 && failedAttempts > 0) {
          errorMessage += `. ${remainingAttempts} intentos restantes.`;
        } else if (remainingAttempts === 0) {
          errorMessage = `Demasiados intentos fallidos. Acceso bloqueado por ${BLOCK_DURATION / 60000} minutos.`;
        }
        
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    clearAuthData();
    setIsAuthenticated(false);
  };

  // Obtener usuario actual
  const getAdminUser = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USERNAME);
  };

  // Renovar token
  const refreshToken = async (): Promise<boolean> => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: AdminLoginResponse = await response.json();
        const expiresAt = Date.now() + (data.expires_in * 1000);
        
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
        
        return true;
      } else {
        clearAuthData();
        setIsAuthenticated(false);
        return false;
      }
    } catch (err) {
      console.error('Error renovando token:', err);
      return false;
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyToken();
      setIsAuthenticated(isValid);
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Auto-renovar token antes de que expire
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      if (expiresAt) {
        const expiration = parseInt(expiresAt);
        const now = Date.now();
        const timeUntilExpiry = expiration - now;
        
        // Renovar si queda menos de 10 minutos
        if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
          await refreshToken();
        }
      }
    }, 5 * 60 * 1000); // Verificar cada 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    getAdminUser,
    isBlocked: isBlocked(),
    blockTimeRemaining: getBlockTimeRemaining(),
    refreshToken
  };
}; 