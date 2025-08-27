import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Search, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useAdminResponses } from '@/hooks/useAdminResponses';
import { AutodiagnosticoSesionResumen, AutodiagnosticoSesion } from '@/types/autodiagnostico';

const AdminResponsesList: React.FC = () => {
  const { 
    sesiones, 
    sesionDetalle, 
    loading, 
    error, 
    fetchSesionesResumen,
    fetchSesionDetalle 
  } = useAdminResponses();

  const [selectedSesion, setSelectedSesion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchSesionesResumen();
  }, []);

  const handleViewDetails = async (sessionId: string) => {
    setSelectedSesion(sessionId);
    await fetchSesionDetalle(sessionId);
    setShowDetailsDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUserAgent = (userAgent?: string) => {
    if (!userAgent) return 'Desconocido';
    
    // Extraer información básica del user agent
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !isChrome;
    
    let browser = 'Desconocido';
    if (isChrome) browser = 'Chrome';
    else if (isFirefox) browser = 'Firefox';
    else if (isSafari) browser = 'Safari';
    
    return `${browser} ${isMobile ? '(Mobile)' : '(Desktop)'}`;
  };

  const filteredSesiones = sesiones.filter(sesion =>
    sesion.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sesion.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderRespuestaValue = (respuesta: any) => {
    if (respuesta.respuesta_texto) {
      return respuesta.respuesta_texto.length > 50 
        ? `${respuesta.respuesta_texto.substring(0, 50)}...`
        : respuesta.respuesta_texto;
    }
    if (respuesta.respuesta_numero !== null && respuesta.respuesta_numero !== undefined) {
      return respuesta.respuesta_numero.toString();
    }
    if (respuesta.opcion_seleccionada) {
      return respuesta.opcion_seleccionada;
    }
    if (respuesta.opciones_seleccionadas && respuesta.opciones_seleccionadas.length > 0) {
      return respuesta.opciones_seleccionadas.join(', ');
    }
    return 'Sin respuesta';
  };

  if (loading && sesiones.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando respuestas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Respuestas del Autodiagnóstico</h2>
          <p className="text-muted-foreground">
            Gestiona y revisa las respuestas enviadas por los usuarios
          </p>
        </div>
        <Button onClick={fetchSesionesResumen} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar por ID de sesión o IP</Label>
              <Input
                id="search"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de sesiones */}
      <Card>
        <CardHeader>
          <CardTitle>
            Sesiones de Respuestas ({filteredSesiones.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Sesión</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Respuestas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Navegador</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSesiones.map((sesion) => (
                <TableRow key={sesion.session_id}>
                  <TableCell className="font-mono text-sm">
                    {sesion.session_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(sesion.fecha_inicio)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {sesion.total_respuestas} respuestas
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sesion.completado ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incompleto
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {sesion.ip_address || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatUserAgent(sesion.user_agent)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(sesion.session_id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSesiones.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron sesiones de respuestas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalles de la Sesión: {selectedSesion?.substring(0, 8)}...
            </DialogTitle>
          </DialogHeader>
          
          {sesionDetalle && (
            <div className="space-y-6">
              {/* Información de la sesión */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ID de Sesión</Label>
                      <p className="font-mono text-sm">{sesionDetalle.session_id}</p>
                    </div>
                    <div>
                      <Label>Fecha de Creación</Label>
                      <p>{formatDate(sesionDetalle.created_at)}</p>
                    </div>
                    <div>
                      <Label>Total de Preguntas</Label>
                      <p>{sesionDetalle.total_preguntas}</p>
                    </div>
                    <div>
                      <Label>Preguntas Respondidas</Label>
                      <p>{sesionDetalle.preguntas_respondidas}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Respuestas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Respuestas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sesionDetalle.respuestas.map((respuesta, index) => (
                      <div key={respuesta.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            {index + 1}. {respuesta.pregunta.pregunta}
                          </h4>
                          <Badge variant="outline">
                            {respuesta.pregunta.tipo_respuesta}
                          </Badge>
                        </div>
                        
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-sm font-medium text-gray-700">Respuesta:</p>
                          <p className="mt-1">{renderRespuestaValue(respuesta)}</p>
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                          Respondido: {formatDate(respuesta.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResponsesList; 