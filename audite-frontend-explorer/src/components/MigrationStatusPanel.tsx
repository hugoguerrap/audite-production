/**
 * Panel de Estado de Migración
 * ============================
 * 
 * Componente para mostrar el estado de la migración del sistema tradicional
 * al sistema avanzado de formularios por industria.
 * 
 * Muestra:
 * - Estado actual de la migración
 * - Estadísticas de datos migrados
 * - Acciones disponibles
 * - Progreso del proceso
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ArrowRight,
  RefreshCw,
  FileText,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';

interface MigrationStats {
  traditional_system: {
    preguntas: number;
    opciones: number;
    respuestas: number;
    sesiones: number;
  };
  advanced_system: {
    categorias: number;
    formularios: number;
    preguntas: number;
    preguntas_condicionales: number;
    respuestas: number;
    sesiones: number;
  };
  migration_status: {
    completed: boolean;
    prerequisites_met: boolean;
    preguntas_migradas: number;
    respuestas_migradas: number;
    errors: number;
    last_run: string | null;
  };
}

interface MigrationStatusPanelProps {
  onMigrationComplete?: () => void;
}

const MigrationStatusPanel: React.FC<MigrationStatusPanelProps> = ({ 
  onMigrationComplete 
}) => {
  const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExecutingMigration, setIsExecutingMigration] = useState(false);

  const fetchMigrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar endpoint real para obtener estado de migración
      // Por ahora, datos simulados para demostración
      const simulatedStats: MigrationStats = {
        traditional_system: {
          preguntas: 12,
          opciones: 48,
          respuestas: 245,
          sesiones: 67
        },
        advanced_system: {
          categorias: 4,
          formularios: 3,
          preguntas: 8,
          preguntas_condicionales: 2,
          respuestas: 156,
          sesiones: 43
        },
        migration_status: {
          completed: false,
          prerequisites_met: true,
          preguntas_migradas: 0,
          respuestas_migradas: 0,
          errors: 0,
          last_run: null
        }
      };

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMigrationStats(simulatedStats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const executeMigration = async () => {
    setIsExecutingMigration(true);
    setError(null);

    try {
      // TODO: Implementar llamada real al endpoint de migración
      // Por ahora, simulación
      
      // Simular progreso de migración
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Aquí se actualizaría el progreso real
      }

      // Actualizar estado después de migración simulada
      if (migrationStats) {
        const updatedStats = {
          ...migrationStats,
          migration_status: {
            ...migrationStats.migration_status,
            completed: true,
            preguntas_migradas: migrationStats.traditional_system.preguntas,
            respuestas_migradas: migrationStats.traditional_system.respuestas,
            last_run: new Date().toISOString()
          }
        };
        setMigrationStats(updatedStats);
      }

      onMigrationComplete?.();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en migración');
    } finally {
      setIsExecutingMigration(false);
    }
  };

  useEffect(() => {
    fetchMigrationStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando estado de migración...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error cargando estado de migración: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!migrationStats) {
    return null;
  }

  const { traditional_system, advanced_system, migration_status } = migrationStats;

  const calculateMigrationProgress = () => {
    if (!migration_status.completed) return 0;
    
    const totalItems = traditional_system.preguntas + traditional_system.respuestas;
    const migratedItems = migration_status.preguntas_migradas + migration_status.respuestas_migradas;
    
    return totalItems > 0 ? (migratedItems / totalItems) * 100 : 0;
  };

  const migrationProgress = calculateMigrationProgress();

  return (
    <div className="space-y-6">
      {/* Header con estado general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Estado de Migración del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {migration_status.completed ? (
                <Badge variant="default" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Migración Completada
                </Badge>
              ) : migration_status.prerequisites_met ? (
                <Badge variant="secondary" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Listo para Migrar
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Prerequisitos Pendientes
                </Badge>
              )}
              
              {migration_status.last_run && (
                <span className="text-sm text-muted-foreground">
                  Última ejecución: {new Date(migration_status.last_run).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMigrationStatus}
                disabled={loading || isExecutingMigration}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>

              {!migration_status.completed && migration_status.prerequisites_met && (
                <Button
                  onClick={executeMigration}
                  disabled={isExecutingMigration}
                  className="gap-2"
                >
                  {isExecutingMigration ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {isExecutingMigration ? 'Migrando...' : 'Ejecutar Migración'}
                </Button>
              )}
            </div>
          </div>

          {/* Barra de progreso durante migración */}
          {isExecutingMigration && (
            <div className="mt-4">
              <Progress value={migrationProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Migrando datos del sistema tradicional...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs con detalles */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="actions">Acciones</TabsTrigger>
        </TabsList>

        {/* Tab: Comparación de sistemas */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sistema Tradicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sistema Tradicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Preguntas:</span>
                    <div className="font-semibold text-lg">{traditional_system.preguntas}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Opciones:</span>
                    <div className="font-semibold text-lg">{traditional_system.opciones}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Respuestas:</span>
                    <div className="font-semibold text-lg">{traditional_system.respuestas}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sesiones:</span>
                    <div className="font-semibold text-lg">{traditional_system.sesiones}</div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Sin lógica condicional
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sistema Avanzado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Sistema Avanzado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categorías:</span>
                    <div className="font-semibold text-lg">{advanced_system.categorias}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formularios:</span>
                    <div className="font-semibold text-lg">{advanced_system.formularios}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preguntas:</span>
                    <div className="font-semibold text-lg">{advanced_system.preguntas}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">P. Condicionales:</span>
                    <div className="font-semibold text-lg text-blue-600">{advanced_system.preguntas_condicionales}</div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Con lógica condicional avanzada
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Progreso de migración */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progreso de Migración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {migration_status.completed ? (
                <div className="space-y-3">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Migración completada exitosamente. Todos los datos han sido transferidos al sistema unificado.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                          {migration_status.preguntas_migradas}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Preguntas Migradas
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                          {migration_status.respuestas_migradas}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Respuestas Migradas
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Migración Pendiente</h3>
                  <p className="text-sm text-muted-foreground">
                    El sistema está listo para migrar los datos del sistema tradicional al avanzado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Acciones disponibles */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Herramientas de Migración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={fetchMigrationStatus}>
                  <Settings className="h-4 w-4 mr-2" />
                  Verificar Estado del Sistema
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Logs de Migración
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Crear Backup Manual
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>
                    <strong>📋 Guía de Migración:</strong>
                    <p className="text-muted-foreground">
                      Proceso completo para unificar los sistemas de formularios.
                    </p>
                  </div>
                  
                  <div>
                    <strong>⚠️ Consideraciones:</strong>
                    <p className="text-muted-foreground">
                      La migración preserva todos los datos existentes y mejora las capacidades del sistema.
                    </p>
                  </div>
                  
                  <div>
                    <strong>🔄 Rollback:</strong>
                    <p className="text-muted-foreground">
                      Se crean backups automáticos para revertir cambios si necesario.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MigrationStatusPanel;