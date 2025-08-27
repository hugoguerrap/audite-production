import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Lock, User, AlertTriangle, Clock } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    loading: authLoading, 
    login, 
    isBlocked, 
    blockTimeRemaining 
  } = useAdminAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Actualizar tiempo de bloqueo
  useEffect(() => {
    if (isBlocked) {
      setTimeRemaining(blockTimeRemaining);
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.reload(); // Recargar para verificar si el bloqueo expiró
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isBlocked, blockTimeRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError(`Acceso bloqueado. Intenta nuevamente en ${Math.ceil(timeRemaining / 60)} minutos.`);
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await login({ username: username.trim(), password });
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-audite-secondary font-body">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="w-full max-w-md space-y-8">
        {/* Header con Logo */}
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo primary@2x.png" 
              alt="AuditE - Conecta. Ahorra. Transforma." 
              className="logo-primary"
            />
          </div>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-brand font-bold text-audite-dark mb-2">
            Panel de Administración
          </h1>
          <p className="text-audite-secondary font-body">
            Acceso seguro al sistema AuditE
          </p>
        </div>

        <Card className="auth-card animate-fade-in">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-brand font-semibold text-audite-dark">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-audite-secondary font-body">
              Ingresa tus credenciales de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mostrar bloqueo si está activo */}
            {isBlocked && (
              <Alert variant="destructive" className="mb-6 border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center gap-2 font-body">
                  <Lock className="h-4 w-4" />
                  Acceso bloqueado por seguridad.
                  <div className="flex items-center gap-1 ml-auto font-brand font-medium">
                    <Clock className="h-4 w-4" />
                    {formatTime(timeRemaining)}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Mostrar error */}
            {error && (
              <Alert variant="destructive" className="mb-6 border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-body">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <Label htmlFor="username" className="form-label">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-audite-secondary" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input pl-10"
                    disabled={loading || isBlocked}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <Label htmlFor="password" className="form-label">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-audite-secondary" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10 pr-10"
                    disabled={loading || isBlocked}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-audite-secondary hover:text-audite-dark transition-colors"
                    disabled={loading || isBlocked}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || isBlocked}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Verificando...
                  </>
                ) : isBlocked ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Acceso Bloqueado
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Acceder al Panel
                  </>
                )}
              </Button>
            </form>

            {/* Footer con información de seguridad */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-audite-secondary font-body mb-2">
                  Sistema protegido con autenticación JWT
                </p>
                <div className="slogan text-sm">
                  Conecta. Ahorra. Transforma.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="text-center text-xs text-audite-secondary font-body animate-fade-in">
          <p>© 2024 AuditE. Todos los derechos reservados.</p>
          <p className="mt-1">Plataforma de auditorías energéticas especializadas</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 