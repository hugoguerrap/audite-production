import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminQuestions, AdminPregunta } from '@/hooks/useAdminQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  LogOut, 
  Plus, 
  BarChart3, 
  MessageSquare,
  Users,
  Factory,
  FileText,
  HelpCircle
} from 'lucide-react';
import AdminQuestionForm from './AdminQuestionForm';
import AdminQuestionList from './AdminQuestionList';
import AdminResponsesList from './AdminResponsesList';
// Nuevos componentes para Formularios por Industria
import AdminCategoriasIndustria from './FormulariosIndustria/AdminCategoriasIndustria';
import AdminFormulariosIndustria from './FormulariosIndustria/AdminFormulariosIndustria';
import AdminPreguntasSimple from './FormulariosIndustria/AdminPreguntasSimple';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, getAdminUser } = useAdminAuth();
  const { preguntas, loading, error, fetchPreguntas, togglePreguntaActiva, deletePregunta, getEstadisticas } = useAdminQuestions();
  const [showForm, setShowForm] = useState(false);
  const [editingPregunta, setEditingPregunta] = useState<AdminPregunta | null>(null);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Función de logout con redirección
  const handleLogout = () => {
    logout();
    navigate('/admin'); // Redirigir al login
  };

  const adminUser = getAdminUser();

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    setLoadingStats(true);
    try {
      const stats = await getEstadisticas();
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally { 
      setLoadingStats(false);
    }
  };

  const handleEdit = (pregunta: AdminPregunta) => {
    setEditingPregunta(pregunta);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      try {
        await deletePregunta(id);
      } catch (err) {
        console.error('Error eliminando pregunta:', err);
      }
    }
  };

  const handleToggleActive = async (id: number, activa: boolean) => {
    try {
      await togglePreguntaActiva(id, activa);
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPregunta(null);
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingPregunta(null);
    // Refrescar la lista de preguntas después de una actualización exitosa
    await fetchPreguntas();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Logo de AuditE en el panel de admin */}
            <img 
              src="/logo primary@2x.png" 
              alt="AuditE - Conecta. Ahorra. Transforma." 
              className="h-20 w-auto object-contain"
              style={{ maxWidth: '300px' }}
            />
            <div className="border-l border-border pl-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Panel de Administración</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {adminUser}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="preguntas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="categorias-industria">
              <Factory className="h-4 w-4 mr-2" />
              Categorías
            </TabsTrigger>
            <TabsTrigger value="formularios-industria">
              <FileText className="h-4 w-4 mr-2" />
              Formularios
            </TabsTrigger>
            <TabsTrigger value="preguntas-formulario">
              <HelpCircle className="h-4 w-4 mr-2" />
              Preguntas
            </TabsTrigger>
            <TabsTrigger value="preguntas">
              <MessageSquare className="h-4 w-4 mr-2" />
              Autodiagnóstico
            </TabsTrigger>
            <TabsTrigger value="respuestas">
              <Users className="h-4 w-4 mr-2" />
              Respuestas
            </TabsTrigger>
            <TabsTrigger value="estadisticas">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          {/* Tab de Categorías de Industria */}
          <TabsContent value="categorias-industria" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Categorías de Industria</h2>
              <p className="text-muted-foreground">
                Gestiona las categorías de industria para formularios especializados
              </p>
            </div>
            <AdminCategoriasIndustria />
          </TabsContent>

          {/* Tab de Formularios por Industria */}
          <TabsContent value="formularios-industria" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Formularios por Industria</h2>
              <p className="text-muted-foreground">
                Crea y gestiona formularios especializados para cada industria
              </p>
            </div>
            <AdminFormulariosIndustria />
          </TabsContent>

          {/* Tab de Preguntas de Formularios por Industria */}
          <TabsContent value="preguntas-formulario" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Preguntas de Formularios</h2>
              <p className="text-muted-foreground">
                Gestiona las preguntas de los formularios por industria
              </p>
            </div>
            <AdminPreguntasSimple />
          </TabsContent>

          {/* Tab de Gestión de Preguntas (Autodiagnóstico tradicional) */}
          <TabsContent value="preguntas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Gestión de Preguntas</h2>
                <p className="text-muted-foreground">
                  Administra las preguntas del autodiagnóstico energético
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Pregunta
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Cargando preguntas...</p>
                </div>
              </div>
            ) : (
              <AdminQuestionList
                preguntas={preguntas}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            )}
          </TabsContent>

          {/* Tab de Respuestas */}
          <TabsContent value="respuestas" className="space-y-6">
            <AdminResponsesList />
          </TabsContent>

          {/* Tab de Estadísticas */}
          <TabsContent value="estadisticas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Estadísticas</h2>
                <p className="text-muted-foreground">
                  Información general del sistema de autodiagnóstico
                </p>
              </div>
              <Button variant="outline" onClick={loadEstadisticas}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>

            {loadingStats ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Cargando estadísticas...</p>
                </div>
              </div>
            ) : estadisticas ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Preguntas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{estadisticas.total_preguntas || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {estadisticas.preguntas_activas || 0} activas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Sesiones Iniciadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{estadisticas.total_sesiones || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Usuarios que iniciaron el autodiagnóstico
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{estadisticas.sesiones_completadas || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Autodiagnósticos completados
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Tasa de Completitud</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {estadisticas.total_sesiones > 0 
                          ? Math.round((estadisticas.sesiones_completadas / estadisticas.total_sesiones) * 100)
                          : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Porcentaje de finalización
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Respuestas por pregunta */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Respuestas por Pregunta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(estadisticas.respuestas_por_pregunta || {})
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([preguntaId, count]) => (
                          <div key={preguntaId} className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm">Pregunta #{preguntaId}</span>
                            <Badge variant="outline">{count} respuestas</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Respuestas más comunes */}
                {Object.keys(estadisticas.respuestas_mas_comunes || {}).length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Respuestas Más Comunes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(estadisticas.respuestas_mas_comunes || {}).map(([preguntaId, respuestas]) => (
                          <div key={preguntaId} className="space-y-2">
                            <h4 className="font-medium text-sm">Pregunta #{preguntaId}</h4>
                            <div className="space-y-1 pl-4">
                              {(respuestas as Array<{opcion: string, count: number}>).map((respuesta, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">{respuesta.opcion}</span>
                                  <Badge variant="secondary">{respuesta.count} veces</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No se pudieron cargar las estadísticas
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Formulario */}
      {showForm && (
        <AdminQuestionForm
          pregunta={editingPregunta}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default AdminDashboard;