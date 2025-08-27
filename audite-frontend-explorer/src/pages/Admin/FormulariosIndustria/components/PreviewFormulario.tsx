/**
 * Vista previa interactiva de formularios con lógica condicional
 * Permite simular diferentes flujos y probar el comportamiento completo
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Eye, 
  EyeOff,
  Play,
  RotateCcw,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Target,
  ChevronDown,
  ChevronRight,
  Zap,
  Activity,
  Settings,
  Download,
  BarChart3
} from 'lucide-react';
import { 
  PreguntaFormulario, 
  FormularioIndustria, 
  RespuestaConOtro,
  CondicionPregunta 
} from '@/types/industria';
import { useAdminPreguntasCondicionales } from '../hooks/useAdminPreguntasCondicionales';

interface PreviewFormularioProps {
  formularioId: number;
  readonly?: boolean;
}

interface EstadoSimulacion {
  respuestas: Record<number, RespuestaConOtro>;
  preguntasVisibles: Set<number>;
  preguntasCompletadas: Set<number>;
  preguntasNuncaMostradas: Set<number>;
  currentStep: number;
  modoSimulacion: boolean;
}

const PreviewFormulario: React.FC<PreviewFormularioProps> = ({
  formularioId,
  readonly = false
}) => {
  // Estados principales
  const [estado, setEstado] = useState<EstadoSimulacion>({
    respuestas: {},
    preguntasVisibles: new Set(),
    preguntasCompletadas: new Set(),
    preguntasNuncaMostradas: new Set(),
    currentStep: 0,
    modoSimulacion: false
  });

  // Estados UI
  const [mostrarAnalisis, setMostrarAnalisis] = useState(false);
  const [modoVista, setModoVista] = useState<'preview' | 'debug' | 'flowchart'>('preview');

  // Hook para datos
  const {
    preguntas,
    formulario,
    loading,
    error,
    fetchPreguntas,
    fetchFormulario
  } = useAdminPreguntasCondicionales();

  // Efecto para cargar datos
  useEffect(() => {
    if (formularioId) {
      fetchFormulario(formularioId);
      fetchPreguntas(formularioId);
    }
  }, [formularioId, fetchFormulario, fetchPreguntas]);

  // Efecto para inicializar estado cuando cambian las preguntas
  useEffect(() => {
    if (preguntas.length > 0) {
      inicializarEstado();
    }
  }, [preguntas]);

  // Función para inicializar estado del formulario
  const inicializarEstado = () => {
    const preguntasIndependientes = preguntas.filter(p => !p.pregunta_padre_id && p.activa);
    const todasLasPreguntas = new Set(preguntas.map(p => p.id));
    const preguntasVisiblesIniciales = new Set(preguntasIndependientes.map(p => p.id));
    
    setEstado({
      respuestas: {},
      preguntasVisibles: preguntasVisiblesIniciales,
      preguntasCompletadas: new Set(),
      preguntasNuncaMostradas: new Set([...todasLasPreguntas].filter(id => !preguntasVisiblesIniciales.has(id))),
      currentStep: 0,
      modoSimulacion: false
    });
  };

  // Función para evaluar condiciones y actualizar visibilidad
  const evaluarVisibilidad = (nuevasRespuestas: Record<number, RespuestaConOtro>) => {
    const preguntasVisibles = new Set<number>();
    const preguntasCompletadas = new Set<number>();
    
    // Agregar preguntas independientes que están activas
    preguntas.forEach(pregunta => {
      if (!pregunta.pregunta_padre_id && pregunta.activa) {
        preguntasVisibles.add(pregunta.id);
        if (nuevasRespuestas[pregunta.id]) {
          preguntasCompletadas.add(pregunta.id);
        }
      }
    });

    // Evaluar preguntas condicionales
    const evaluarPregunta = (pregunta: PreguntaFormulario): boolean => {
      if (!pregunta.pregunta_padre_id || !pregunta.activa) return false;
      
      const respuestaPadre = nuevasRespuestas[pregunta.pregunta_padre_id];
      if (!respuestaPadre) return false;

      // Evaluar cada condición
      return pregunta.condiciones?.every(condicion => {
        return evaluarCondicion(condicion, respuestaPadre);
      }) || false;
    };

    const evaluarCondicion = (condicion: CondicionPregunta, respuesta: RespuestaConOtro): boolean => {
      const valorRespuesta = respuesta.valor;
      const valorEsperado = condicion.valor_esperado;

      switch (condicion.operador) {
        case '=':
          return valorRespuesta === valorEsperado;
        case '!=':
          return valorRespuesta !== valorEsperado;
        case 'includes':
          if (Array.isArray(valorRespuesta)) {
            return valorRespuesta.includes(valorEsperado);
          }
          return valorRespuesta.toString().toLowerCase().includes(valorEsperado.toLowerCase());
        case 'not_includes':
          if (Array.isArray(valorRespuesta)) {
            return !valorRespuesta.includes(valorEsperado);
          }
          return !valorRespuesta.toString().toLowerCase().includes(valorEsperado.toLowerCase());
        default:
          return false;
      }
    };

    // Evaluar preguntas condicionales múltiples veces hasta estabilizar
    let cambios = true;
    let iteraciones = 0;
    while (cambios && iteraciones < 10) { // Prevenir bucles infinitos
      cambios = false;
      iteraciones++;

      preguntas.forEach(pregunta => {
        if (pregunta.pregunta_padre_id && !preguntasVisibles.has(pregunta.id)) {
          if (evaluarPregunta(pregunta)) {
            preguntasVisibles.add(pregunta.id);
            cambios = true;
            
            if (nuevasRespuestas[pregunta.id]) {
              preguntasCompletadas.add(pregunta.id);
            }
          }
        }
      });
    }

    // Calcular preguntas que nunca se mostrarían
    const todasLasPreguntas = new Set(preguntas.map(p => p.id));
    const preguntasNuncaMostradas = new Set([...todasLasPreguntas].filter(id => !preguntasVisibles.has(id)));

    return {
      preguntasVisibles,
      preguntasCompletadas,
      preguntasNuncaMostradas
    };
  };

  // Función para manejar cambio de respuesta
  const handleRespuestaChange = (preguntaId: number, valor: any, valorOtro?: string) => {
    const nuevasRespuestas = {
      ...estado.respuestas,
      [preguntaId]: {
        pregunta_id: preguntaId,
        valor: valor,
        valor_otro: valorOtro || null
      }
    };

    const { preguntasVisibles, preguntasCompletadas, preguntasNuncaMostradas } = evaluarVisibilidad(nuevasRespuestas);

    setEstado(prev => ({
      ...prev,
      respuestas: nuevasRespuestas,
      preguntasVisibles,
      preguntasCompletadas,
      preguntasNuncaMostradas
    }));
  };

  // Función para iniciar modo simulación
  const iniciarSimulacion = () => {
    inicializarEstado();
    setEstado(prev => ({ ...prev, modoSimulacion: true }));
  };

  // Función para resetear simulación
  const resetearSimulacion = () => {
    inicializarEstado();
  };

  // Función para abrir en nueva pestaña
  const abrirEnNuevaPestana = () => {
    const url = `/diagnostico-industria/${formulario?.categoria_industria_id}?form=${formularioId}`;
    window.open(url, '_blank');
  };

  // Función para renderizar pregunta
  const renderPregunta = (pregunta: PreguntaFormulario) => {
    const esVisible = estado.preguntasVisibles.has(pregunta.id);
    const esCompletada = estado.preguntasCompletadas.has(pregunta.id);
    const respuestaActual = estado.respuestas[pregunta.id];

    if (!esVisible && modoVista === 'preview') return null;

    const renderCampoRespuesta = () => {
      switch (pregunta.tipo_pregunta) {
        case 'radio':
          return (
            <div className="space-y-2">
              {pregunta.opciones?.map((opcion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`pregunta_${pregunta.id}`}
                    value={opcion.valor}
                    checked={respuestaActual?.valor === opcion.valor}
                    onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                    disabled={readonly && !estado.modoSimulacion}
                  />
                  <label className="text-sm">{opcion.texto}</label>
                </div>
              ))}
              {pregunta.tiene_opcion_otro && (
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`pregunta_${pregunta.id}`}
                    value="otro"
                    checked={respuestaActual?.valor === 'otro'}
                    onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                    disabled={readonly && !estado.modoSimulacion}
                  />
                  <label className="text-sm">Otro:</label>
                  <Input
                    type="text"
                    placeholder="Especificar..."
                    value={respuestaActual?.valor === 'otro' ? respuestaActual.valor_otro || '' : ''}
                    onChange={(e) => handleRespuestaChange(pregunta.id, 'otro', e.target.value)}
                    disabled={readonly && !estado.modoSimulacion}
                    className="max-w-xs"
                  />
                </div>
              )}
            </div>
          );

        case 'checkbox':
          return (
            <div className="space-y-2">
              {pregunta.opciones?.map((opcion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={opcion.valor}
                    checked={Array.isArray(respuestaActual?.valor) && respuestaActual.valor.includes(opcion.valor)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(respuestaActual?.valor) ? respuestaActual.valor : [];
                      const newValues = e.target.checked
                        ? [...currentValues, opcion.valor]
                        : currentValues.filter(v => v !== opcion.valor);
                      handleRespuestaChange(pregunta.id, newValues);
                    }}
                    disabled={readonly && !estado.modoSimulacion}
                  />
                  <label className="text-sm">{opcion.texto}</label>
                </div>
              ))}
            </div>
          );

        case 'select':
          return (
            <Select
              value={respuestaActual?.valor || ''}
              onValueChange={(value) => handleRespuestaChange(pregunta.id, value)}
              disabled={readonly && !estado.modoSimulacion}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar opción..." />
              </SelectTrigger>
              <SelectContent>
                {pregunta.opciones?.map((opcion, index) => (
                  <SelectItem key={index} value={opcion.valor}>
                    {opcion.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'text':
          return (
            <Textarea
              value={respuestaActual?.valor || ''}
              onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
              placeholder="Escriba su respuesta..."
              disabled={readonly && !estado.modoSimulacion}
              rows={3}
            />
          );

        case 'number':
          return (
            <Input
              type="number"
              value={respuestaActual?.valor || ''}
              onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
              placeholder="Ingrese un número..."
              disabled={readonly && !estado.modoSimulacion}
            />
          );

        case 'ordering':
          // Implementación simplificada para preview
          return (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Ordenar por prioridad:</p>
              {pregunta.opciones?.map((opcion, index) => (
                <div key={index} className="p-2 border rounded bg-gray-50">
                  <span className="text-sm">{index + 1}. {opcion.texto}</span>
                </div>
              ))}
            </div>
          );

        default:
          return <p className="text-sm text-gray-500">Tipo de pregunta no soportado en preview</p>;
      }
    };

    return (
      <Card 
        key={pregunta.id} 
        className={`
          ${!esVisible ? 'opacity-50 border-dashed' : ''}
          ${esCompletada ? 'border-green-500' : ''}
          ${pregunta.pregunta_padre_id ? 'ml-6 border-l-4 border-l-blue-300' : ''}
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {pregunta.texto_pregunta}
                {pregunta.requerida && <span className="text-red-500">*</span>}
                {!esVisible && modoVista === 'debug' && (
                  <Badge variant="outline" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Oculta
                  </Badge>
                )}
                {esCompletada && (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completada
                  </Badge>
                )}
              </CardTitle>
              {pregunta.subtitulo && (
                <p className="text-sm text-muted-foreground mt-1">{pregunta.subtitulo}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{pregunta.tipo_pregunta}</Badge>
              <Badge variant="outline">#{pregunta.orden}</Badge>
              {pregunta.pregunta_padre_id && (
                <Badge variant="secondary">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Condicional
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Mostrar condiciones si aplica */}
        {pregunta.pregunta_padre_id && pregunta.condiciones && pregunta.condiciones.length > 0 && (
          <div className="px-6 pb-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-800 mb-2">Se muestra cuando:</p>
              <div className="space-y-1">
                {pregunta.condiciones.map((condicion, index) => {
                  const preguntaPadre = preguntas.find(p => p.id === condicion.pregunta_padre_id);
                  return (
                    <p key={index} className="text-xs text-blue-700">
                      "{preguntaPadre?.texto_pregunta?.substring(0, 40)}..." {condicion.operador} "{condicion.valor_esperado}"
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <CardContent>
          {renderCampoRespuesta()}
        </CardContent>
      </Card>
    );
  };

  // Calcular estadísticas del preview
  const estadisticas = useMemo(() => {
    const totalPreguntas = preguntas.length;
    const preguntasActivas = preguntas.filter(p => p.activa).length;
    const preguntasCondicionales = preguntas.filter(p => p.pregunta_padre_id).length;
    const progreso = estado.preguntasVisibles.size > 0 
      ? (estado.preguntasCompletadas.size / estado.preguntasVisibles.size) * 100 
      : 0;

    return {
      totalPreguntas,
      preguntasActivas,
      preguntasCondicionales,
      preguntasVisibles: estado.preguntasVisibles.size,
      preguntasCompletadas: estado.preguntasCompletadas.size,
      preguntasNuncaMostradas: estado.preguntasNuncaMostradas.size,
      progreso: Math.round(progreso)
    };
  }, [preguntas, estado]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando vista previa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa - {formulario?.nombre}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Simula el comportamiento real del formulario
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={modoVista} onValueChange={(value: any) => setModoVista(value)}>
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="debug">Debug</TabsTrigger>
                  <TabsTrigger value="flowchart">Flujo</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={estado.modoSimulacion ? "destructive" : "default"}
              size="sm"
              onClick={estado.modoSimulacion ? resetearSimulacion : iniciarSimulacion}
            >
              {estado.modoSimulacion ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetear
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Simular
                </>
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={abrirEnNuevaPestana}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir en nueva pestaña
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarAnalisis(!mostrarAnalisis)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {mostrarAnalisis ? 'Ocultar' : 'Mostrar'} Análisis
            </Button>

            {/* Estadísticas rápidas */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-sm">
                <span className="text-muted-foreground">Progreso:</span>
                <span className="ml-1 font-medium">{estadisticas.progreso}%</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Visibles:</span>
                <span className="ml-1 font-medium">{estadisticas.preguntasVisibles}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Completadas:</span>
                <span className="ml-1 font-medium">{estadisticas.preguntasCompletadas}</span>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          {estado.modoSimulacion && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Progreso del formulario</span>
                <span>{estadisticas.preguntasCompletadas}/{estadisticas.preguntasVisibles}</span>
              </div>
              <Progress value={estadisticas.progreso} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel de análisis */}
      {mostrarAnalisis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Análisis del formulario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{estadisticas.totalPreguntas}</div>
                <p className="text-xs text-muted-foreground">Total preguntas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{estadisticas.preguntasActivas}</div>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{estadisticas.preguntasCondicionales}</div>
                <p className="text-xs text-muted-foreground">Condicionales</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{estadisticas.preguntasNuncaMostradas}</div>
                <p className="text-xs text-muted-foreground">Nunca mostradas</p>
              </div>
            </div>

            {estadisticas.preguntasNuncaMostradas > 0 && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Hay {estadisticas.preguntasNuncaMostradas} pregunta(s) que nunca se mostrarían con la lógica condicional actual.
                  Revisa las condiciones o considera si estas preguntas son necesarias.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Renderizado del formulario */}
      <div className="space-y-4">
        {modoVista === 'preview' && (
          <>
            {preguntas
              .filter(p => p.activa)
              .sort((a, b) => (a.orden || 0) - (b.orden || 0))
              .map(pregunta => renderPregunta(pregunta))}
          </>
        )}

        {modoVista === 'debug' && (
          <>
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Modo debug: Se muestran todas las preguntas, incluyendo las ocultas por lógica condicional.
              </AlertDescription>
            </Alert>
            {preguntas
              .sort((a, b) => (a.orden || 0) - (b.orden || 0))
              .map(pregunta => renderPregunta(pregunta))}
          </>
        )}

        {modoVista === 'flowchart' && (
          <Card>
            <CardHeader>
              <CardTitle>Diagrama de flujo condicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preguntas
                  .filter(p => !p.pregunta_padre_id)
                  .map(pregunta => (
                    <div key={pregunta.id} className="space-y-2">
                      <div className="p-3 border rounded bg-blue-50">
                        <p className="font-medium">{pregunta.texto_pregunta}</p>
                        <Badge variant="outline" className="mt-1">{pregunta.tipo_pregunta}</Badge>
                      </div>
                      {/* Preguntas hijas */}
                      {preguntas
                        .filter(p => p.pregunta_padre_id === pregunta.id)
                        .map(hija => (
                          <div key={hija.id} className="ml-8 space-y-2">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                              <div className="p-2 border rounded bg-yellow-50 flex-1">
                                <p className="text-sm font-medium">{hija.texto_pregunta}</p>
                                <div className="text-xs text-gray-600 mt-1">
                                  {hija.condiciones?.map((condicion, index) => (
                                    <span key={index}>
                                      {condicion.operador} "{condicion.valor_esperado}"
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {preguntas.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay preguntas</h3>
              <p className="text-muted-foreground">
                Este formulario no tiene preguntas configuradas todavía.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PreviewFormulario; 