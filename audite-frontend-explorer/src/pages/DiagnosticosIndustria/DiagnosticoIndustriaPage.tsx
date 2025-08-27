/**
 * Página principal para diagnósticos energéticos por industria
 * Incluye selección de categoría, formulario dinámico y sugerencias personalizadas
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ArrowLeft,
  Clock,
  FileText
} from 'lucide-react';
import { useIndustryCategories } from './hooks/useIndustryCategories';
import { useDiagnosticoIndustria } from './hooks/useDiagnosticoIndustria';
import FormularioRenderer from './components/FormularioRenderer';
import ProgressIndicator from './components/ProgressIndicator';

const DiagnosticoIndustriaPage: React.FC = () => {
  const { categoriaId } = useParams<{ categoriaId: string }>();
  const navigate = useNavigate();
  
  // Estados locales
  const [currentStep, setCurrentStep] = useState(0);
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<number | null>(null);
  const [showFormularioSelector, setShowFormularioSelector] = useState(false);

  // Hooks principales
  const { getCategoriaById } = useIndustryCategories();
  const {
    formularios,
    preguntas,
    preguntasVisibles,
    respuestas,
    progreso,
    cargandoFormularios,
    cargandoPreguntas,
    enviandoRespuestas,
    error,
    estadoFormulario,
    fetchFormularios,
    fetchPreguntas,
    saveRespuesta,
    submitRespuestas,
    validarRespuestas,
    resetearFormulario
  } = useDiagnosticoIndustria();

  // Obtener categoría seleccionada
  const categoria = categoriaId ? getCategoriaById(parseInt(categoriaId)) : null;

  // Efectos para cargar datos
  useEffect(() => {
    if (categoriaId) {
      const id = parseInt(categoriaId);
      fetchFormularios(id);
    }
  }, [categoriaId, fetchFormularios]);

  // Efecto para seleccionar formulario automáticamente si solo hay uno
  useEffect(() => {
    if (formularios.length === 1 && !formularioSeleccionado) {
      setFormularioSeleccionado(formularios[0].id);
      setShowFormularioSelector(false);
    } else if (formularios.length > 1 && !formularioSeleccionado) {
      setShowFormularioSelector(true);
    }
  }, [formularios, formularioSeleccionado]);

  // Efecto para cargar preguntas cuando se selecciona formulario
  useEffect(() => {
    if (formularioSeleccionado) {
      fetchPreguntas(formularioSeleccionado, respuestas);
      setCurrentStep(0);
    }
  }, [formularioSeleccionado, fetchPreguntas]);

  // Funciones de navegación
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < preguntasVisibles.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!formularioSeleccionado) return;

    const esValido = validarRespuestas();
    if (!esValido) {
      alert('Por favor completa todas las preguntas requeridas antes de enviar.');
      return;
    }

    try {
      await submitRespuestas(formularioSeleccionado);
      // Navegar a página de resultados
      navigate(`/diagnostico-industria/${categoriaId}/resultados`);
    } catch (error) {
      console.error('Error al enviar respuestas:', error);
    }
  };

  const handleRespuestaChange = (preguntaId: number, valor: any, valorOtro?: string) => {
    saveRespuesta(preguntaId, valor, valorOtro);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSelectFormulario = (formularioId: number) => {
    setFormularioSeleccionado(formularioId);
    setShowFormularioSelector(false);
  };

  const handleResetFormulario = () => {
    resetearFormulario();
    setCurrentStep(0);
    setFormularioSeleccionado(null);
    setShowFormularioSelector(formularios.length > 1);
  };

  // Validaciones
  const canGoNext = currentStep < preguntasVisibles.length - 1;
  const canGoPrevious = currentStep > 0;
  const isLastStep = currentStep === preguntasVisibles.length - 1;
  const preguntaActual = preguntasVisibles[currentStep];

  // Renderizado de estados de carga y error
  if (!categoriaId || !categoria) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Categoría de industria no encontrada. 
            <Link to="/" className="ml-2 underline">
              Volver al inicio
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (cargandoFormularios) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="link" 
              onClick={handleBackToHome}
              className="ml-2 h-auto p-0"
            >
              Volver al inicio
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-4 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Navegación hacia atrás */}
            <Button
              variant="ghost"
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>

            {/* Información de la categoría */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{categoria.nombre}</span>
              </div>
              <Badge variant="secondary">
                Diagnóstico Especializado
              </Badge>
            </div>

            {/* Resetear formulario */}
            {formularioSeleccionado && (
              <Button
                variant="outline"
                onClick={handleResetFormulario}
                size="sm"
              >
                Reiniciar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6">
        <div className="space-y-6">
          {/* Selector de formulario si hay múltiples */}
          {showFormularioSelector && formularios.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Selecciona el tipo de diagnóstico
                </CardTitle>
                <CardDescription>
                  Hay múltiples formularios disponibles para {categoria.nombre}. 
                  Selecciona el que mejor se adapte a tu situación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formularios.map((formulario) => (
                    <div
                      key={formulario.id}
                      className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => handleSelectFormulario(formulario.id)}
                    >
                      <h3 className="font-medium mb-2">{formulario.nombre}</h3>
                      {formulario.descripcion && (
                        <p className="text-sm text-gray-600 mb-3">
                          {formulario.descripcion}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {formulario.tiempo_estimado && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formulario.tiempo_estimado} min
                          </div>
                        )}
                        <Badge variant={formulario.activo ? "secondary" : "outline"}>
                          {formulario.activo ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario principal */}
          {formularioSeleccionado && preguntasVisibles.length > 0 && (
            <>
                             {/* Indicador de progreso */}
               <ProgressIndicator
                 currentStep={currentStep + 1}
                 totalSteps={preguntasVisibles.length}
                 visibleSteps={preguntasVisibles.length}
                 completedSteps={progreso.preguntas_respondidas}
               />

               {/* Pregunta actual */}
               <FormularioRenderer
                 formularioId={formularioSeleccionado}
                 onSubmit={handleSubmit}
               />

              {/* Navegación */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={!canGoPrevious || enviandoRespuestas}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        Pregunta {currentStep + 1} de {preguntasVisibles.length}
                      </p>
                      <p className="text-xs text-gray-400">
                        {progreso.porcentaje}% completado
                      </p>
                    </div>

                    {isLastStep ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={enviandoRespuestas}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {enviandoRespuestas ? (
                          <>Enviando...</>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Finalizar Diagnóstico
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={!canGoNext || enviandoRespuestas}
                      >
                        Siguiente
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Estado de formulario sin preguntas */}
          {formularioSeleccionado && preguntasVisibles.length === 0 && !cargandoPreguntas && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay preguntas disponibles para este formulario en este momento.
              </AlertDescription>
            </Alert>
          )}

          {/* Estado cuando no hay formularios */}
          {!showFormularioSelector && formularios.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay formularios disponibles para {categoria.nombre} en este momento.
                <Button 
                  variant="link" 
                  onClick={handleBackToHome}
                  className="ml-2 h-auto p-0"
                >
                  Probar el diagnóstico general
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticoIndustriaPage; 