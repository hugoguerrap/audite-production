/**
 * Gestión simple de preguntas por formulario
 * Con selector de formulario y CRUD completo
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit, RefreshCw, FileText, ArrowLeft } from 'lucide-react';
import { API } from '@/config/api';
import CrearPreguntaSimple from './components/CrearPreguntaSimple';

interface Formulario {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: {
    nombre: string;
  };
}

interface Pregunta {
  id: number;
  formulario_id: number;
  texto: string;
  tipo: string;
  opciones: Array<{
    value: string;
    label: string;
    sugerencia?: string;
  }>;
  orden: number;
  activa: boolean;
}

const AdminPreguntasSimple: React.FC = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<number | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [preguntaEditando, setPreguntaEditando] = useState<Pregunta | null>(null);

  // Función para obtener headers de autenticación
  const getAuthHeaders = () => {
    const adminToken = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };
  };

  // Cargar formularios disponibles
  const cargarFormularios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API.adminFormularios.formularios.list, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFormularios(data || []);
      
      // Seleccionar primer formulario por defecto
      if (data && data.length > 0 && !formularioSeleccionado) {
        setFormularioSeleccionado(data[0].id);
      }

    } catch (err) {
      console.error('Error cargando formularios:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar preguntas de un formulario específico
  const cargarPreguntas = async (formularioId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        API.adminFormularios.preguntas.byFormulario(formularioId),
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPreguntas(data || []);

    } catch (err) {
      console.error('Error cargando preguntas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPreguntas([]);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar pregunta
  const eliminarPregunta = async (preguntaId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      return;
    }

    try {
      const response = await fetch(API.adminFormularios.preguntas.delete(preguntaId), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        // Recargar preguntas del formulario actual
        if (formularioSeleccionado) {
          await cargarPreguntas(formularioSeleccionado);
        }
        alert('Pregunta eliminada correctamente');
      } else {
        throw new Error('Error eliminando pregunta');
      }
    } catch (err) {
      console.error('Error eliminando pregunta:', err);
      alert('Error eliminando pregunta');
    }
  };

  // Efectos
  useEffect(() => {
    cargarFormularios();
  }, []);

  useEffect(() => {
    if (formularioSeleccionado) {
      cargarPreguntas(formularioSeleccionado);
    }
  }, [formularioSeleccionado]);

  // Obtener formulario actual
  const formularioActual = formularios.find(f => f.id === formularioSeleccionado);

  // Si está mostrando formulario de creación/edición
  if (mostrarFormulario && formularioSeleccionado) {
    return (
      <div className="space-y-4">
        {/* Header con botón volver */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Lista
          </Button>
          <div>
            <h3 className="font-semibold">
              {preguntaEditando ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Formulario: {formularioActual?.nombre}
            </p>
          </div>
        </div>

        <CrearPreguntaSimple
          formularioId={formularioSeleccionado}
          preguntaInicial={preguntaEditando}
          onSuccess={() => {
            setMostrarFormulario(false);
            setPreguntaEditando(null);
            cargarPreguntas(formularioSeleccionado);
          }}
          onCancel={() => {
            setMostrarFormulario(false);
            setPreguntaEditando(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Gestión de Preguntas por Formulario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Seleccionar Formulario:</label>
              <Select 
                value={formularioSeleccionado?.toString() || ''} 
                onValueChange={(value) => setFormularioSeleccionado(parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccione un formulario..." />
                </SelectTrigger>
                <SelectContent>
                  {formularios.map((formulario) => (
                    <SelectItem key={formulario.id} value={formulario.id.toString()}>
                      <div>
                        <div className="font-medium">{formulario.nombre}</div>
                        <div className="text-xs text-muted-foreground">
                          {formulario.categoria?.nombre}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-x-2">
              <Button onClick={cargarFormularios} variant="outline" disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              
              {formularioSeleccionado && (
                <Button 
                  onClick={() => setMostrarFormulario(true)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Pregunta
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de preguntas del formulario seleccionado */}
      {formularioSeleccionado && (
        <Card>
          <CardHeader>
            <CardTitle>
              Preguntas de: {formularioActual?.nombre}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {preguntas.length} preguntas encontradas
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Cargando preguntas...</p>
              </div>
            ) : preguntas.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hay preguntas en este formulario</p>
                <Button 
                  onClick={() => setMostrarFormulario(true)} 
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Pregunta
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Pregunta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Opciones</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preguntas
                    .sort((a, b) => a.orden - b.orden)
                    .map((pregunta) => (
                    <TableRow key={pregunta.id}>
                      <TableCell>{pregunta.orden}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pregunta.texto}</div>
                          {pregunta.subtitulo && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {pregunta.subtitulo}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pregunta.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        {pregunta.opciones ? (
                          <div className="space-y-1">
                            {pregunta.opciones.slice(0, 3).map((opcion, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium">{opcion.label}</span>
                                {opcion.sugerencia && (
                                  <div className="text-muted-foreground">
                                    💡 {opcion.sugerencia.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                            ))}
                            {pregunta.opciones.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{pregunta.opciones.length - 3} más...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={pregunta.activa ? "default" : "secondary"}>
                          {pregunta.activa ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPreguntaEditando(pregunta);
                              setMostrarFormulario(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarPregunta(pregunta.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje si no hay formulario seleccionado */}
      {!formularioSeleccionado && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Seleccione un formulario para gestionar sus preguntas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPreguntasSimple; 