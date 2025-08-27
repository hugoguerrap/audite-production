import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Download, ChevronLeft, ArrowUpRight, Zap, File } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { feriaService } from "@/lib/legacyApi";
import { toast } from "@/components/ui/sonner";
import { Progress } from "@/components/ui/progress";

// Interfaces para el modelo de datos
interface DiagnosticResults {
  id: string;
  accessCode: string;
  createdAt: string;
  contactInfo: {
    ubicacion: string;
    cargo: string;
  };
  background: {
    hasPreviousAudits: boolean;
    mainInterest: string;
  };
  production: {
    productType: string;
    exportProducts: boolean;
    processesOfInterest: string[];
  };
  equipment: {
    mostIntensiveEquipment: string;
    energyConsumption: number;
    specificEquipmentMeasured: string | null;
  };
  renewable: {
    interestedInRenewable: boolean;
    electricTariff: string;
    penaltiesReceived: boolean;
    penaltyCount: number | null;
  };
  volume: {
    annualProduction: number;
    productionUnit: string;
    energyCosts: {
      electricity: number;
      fuel: number;
      others: string | null;
    };
    energyCostPercentage: number;
  };
  results: {
    intensidadEnergetica: number;
    costoEnergiaAnual: number;
    potencialAhorro: number;
    puntuacionEficiencia: number;
    comparacionSector: {
      consumoPromedioSector: number;
      diferenciaPorcentual: number;
      eficienciaReferencia: number;
    };
  };
  recomendaciones: Array<{
    id: string;
    categoria: string;
    titulo: string;
    descripcion: string;
    ahorroEstimado: number;
    costoImplementacion: string;
    periodoRetorno: number;
    prioridad: number;
  }>;
  pdfUrl: string | null;
  viewUrl: string;
}

const DiagnosticResultPage = (): React.ReactNode => {
  const { id, accessCode } = useParams<{ id: string; accessCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [diagnostic, setDiagnostic] = useState<DiagnosticResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnostic = async () => {
      try {
        setLoading(true);
        let data;
        
        // Añadir logs para depuración
        console.log('Parámetros de ruta:', { id, accessCode });
        console.log('Ruta actual:', location.pathname);
        
        // Función para comprobar si una cadena parece un código de acceso (mezcla de letras y números)
        const isAccessCodeFormat = (str: string) => /^[A-Z0-9]{6,10}$/.test(str);
        
        // Comprobar si estamos en la ruta /codigo/:accessCode
        if (location.pathname.includes('/codigo/')) {
          // Estamos en la ruta de código de acceso
          const code = accessCode || id; // Si accessCode está undefined, usamos id
          console.log('Usando código de acceso para búsqueda:', code);
          
          try {
            data = await feriaService.getDiagnosticoByCode(code as string);
            console.log('Diagnóstico obtenido:', data);
            
            // Depuración más detallada
            console.log('¿Tiene propiedad results?', data.hasOwnProperty('results'));
            console.log('Tipo de results:', typeof data.results);
            console.log('Valor de results:', data.results);
            console.log('¿results es null?', data.results === null);
            console.log('¿results es undefined?', data.results === undefined);
            
            // Verificar explícitamente que results existe y contiene datos válidos
            if (!isDiagnosticComplete(data)) {
              console.log('Diagnóstico pendiente detectado (valores en cero), redirigiendo a edición');
              toast.info("Este diagnóstico está pendiente de completar");
              
              // Usar setTimeout para evitar errores de renderizado
              setTimeout(() => {
                navigate('/diagnostico-energia', { 
                  state: { 
                    diagnosticMeta: { 
                      id: data.id, 
                      accessCode: code 
                    },
                    isPendingDiagnostic: true
                  }
                });
              }, 10);
              
              return;
            }
          } catch (error) {
            console.error('Error al obtener diagnóstico por código:', error);
            setError("No se pudo encontrar el diagnóstico con ese código de acceso");
            setLoading(false);
            return;
          }
        } 
        // Si tenemos un ID que parece código de acceso, intentamos primero con el código
        else if (id && isAccessCodeFormat(id)) {
          console.log('ID parece ser un código de acceso:', id);
          try {
            // Intentar primero como código de acceso
            data = await feriaService.getDiagnosticoByCode(id);
            console.log('Éxito al buscar por código de acceso');
            console.log('Diagnóstico obtenido:', data);
            
            // Depuración más detallada
            console.log('¿Tiene propiedad results?', data.hasOwnProperty('results'));
            console.log('Tipo de results:', typeof data.results);
            console.log('Valor de results:', data.results);
            console.log('¿results es null?', data.results === null);
            console.log('¿results es undefined?', data.results === undefined);
            
            // Verificar explícitamente que results existe y contiene datos válidos
            if (!isDiagnosticComplete(data)) {
              console.log('Diagnóstico pendiente detectado (valores en cero), redirigiendo a edición');
              toast.info("Este diagnóstico está pendiente de completar");
              
              // Usar setTimeout para evitar errores de renderizado
              setTimeout(() => {
                navigate('/diagnostico-energia', { 
                  state: { 
                    diagnosticMeta: { 
                      id: data.id, 
                      accessCode: id 
                    },
                    isPendingDiagnostic: true
                  }
                });
              }, 10);
              
              return;
            }
          } catch (error) {
            console.log('Fallo al buscar por código de acceso, intentando como ID');
            // Si falla, intentar como ID regular
            data = await feriaService.getDiagnosticoById(id);
          }
        }
        // Para cualquier otro caso, usamos el ID normalmente
        else if (id) {
          console.log('Usando ID para búsqueda:', id);
          data = await feriaService.getDiagnosticoById(id);
        }
        // Si no tenemos ni ID ni código, mostramos un error
        else {
          setError("No se proporcionó un identificador válido para el diagnóstico");
          setLoading(false);
          return;
        }
        
        setDiagnostic(data);
      } catch (err) {
        console.error("Error al obtener el diagnóstico:", err);
        setError("No se pudo cargar el diagnóstico. Verifique el ID o código de acceso e intente más tarde.");
        toast.error("Error al cargar los datos del diagnóstico");
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostic();
  }, [id, accessCode, location.pathname, navigate]);

  // Función para verificar si un diagnóstico está realmente completo
  // (no solo que tenga la propiedad results, sino que tenga valores distintos de cero)
  const isDiagnosticComplete = (diagnostic) => {
    if (!diagnostic || !diagnostic.results) return false;
    
    // Verificar si algún valor en results es distinto de cero
    const { intensidadEnergetica, costoEnergiaAnual, potencialAhorro, puntuacionEficiencia } = diagnostic.results;
    
    // Si todos los valores son cero, consideramos que el diagnóstico está pendiente
    return intensidadEnergetica !== 0 || 
           costoEnergiaAnual !== 0 || 
           potencialAhorro !== 0 || 
           puntuacionEficiencia !== 0;
  };

  // Verificación adicional para evitar mostrar resultados vacíos
  if (diagnostic && !isDiagnosticComplete(diagnostic)) {
    console.log("Verificación final: diagnóstico con valores en cero detectado, redirigiendo");
    console.log('Diagnóstico:', diagnostic);
    console.log('¿Tiene propiedad results?', diagnostic.hasOwnProperty('results'));
    console.log('Tipo de results:', typeof diagnostic.results);
    console.log('Valor de results:', diagnostic.results);
    
    useEffect(() => {
      toast.info("Este diagnóstico está pendiente de completar");
      navigate('/diagnostico-energia', { 
        state: { 
          diagnosticMeta: { 
            id: diagnostic.id, 
            accessCode: diagnostic.accessCode 
          },
          isPendingDiagnostic: true
        }
      });
    }, []);
    
    return (
      <div className="min-h-screen bg-background flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Redirigiendo...</CardTitle>
            <CardDescription>Este diagnóstico está pendiente de completar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={75} />
              <p className="text-sm text-muted-foreground text-center">Redirigiendo al formulario para completar el diagnóstico</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInterestName = (interest: string) => {
    const interestMap: Record<string, string> = {
      reduccion_costos: "Reducción de costos",
      cumplimiento_normativo: "Cumplimiento normativo",
      sostenibilidad: "Sostenibilidad",
      certificacion: "Certificación",
      informacion: "Información general",
      otro: "Otro interés"
    };
    
    return interestMap[interest] || interest;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'equipos':
        return <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
      case 'renovables':
        return <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
      case 'gestion':
        return <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
      case 'procesos':
        return <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getImplementationCostLabel = (cost: string) => {
    switch (cost.toLowerCase()) {
      case 'bajo':
        return <span className="text-green-600 font-medium">Bajo</span>;
      case 'medio':
        return <span className="text-amber-600 font-medium">Medio</span>;
      case 'alto':
        return <span className="text-red-600 font-medium">Alto</span>;
      default:
        return <span>{cost}</span>;
    }
  };

  const handleDownloadPDF = () => {
    if (diagnostic && diagnostic.pdfUrl) {
      window.open(diagnostic.pdfUrl, '_blank');
    } else {
      toast.error("El PDF aún no está disponible. Inténtelo más tarde.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Cargando diagnóstico...</CardTitle>
            <CardDescription>Espere mientras recuperamos su información</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={75} />
              <p className="text-sm text-muted-foreground text-center">Recuperando datos del diagnóstico energético</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !diagnostic) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error al cargar el diagnóstico</CardTitle>
            <CardDescription>No pudimos encontrar el diagnóstico solicitado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">{error || "El diagnóstico no existe o ha sido eliminado."}</p>
            <Button asChild>
              <Link to="/" className="w-full"><Home className="mr-2 h-4 w-4" /> Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col gap-6">
          {/* Logo de AuditE en los resultados */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo primary@2x.png" 
              alt="AuditE - Conecta. Ahorra. Transforma." 
              className="h-36 w-auto object-contain"
              style={{ maxWidth: '550px' }}
            />
          </div>
          
          {/* Cabecera */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Resultados del Diagnóstico Energético</h1>
              <p className="text-muted-foreground">Código de acceso: <span className="font-mono font-bold">{diagnostic.accessCode}</span></p>
              <p className="text-sm text-muted-foreground">Fecha: {new Date(diagnostic.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              {diagnostic.pdfUrl && (
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
              )}
              <Button asChild variant="ghost">
                <Link to="/"><Home className="mr-2 h-4 w-4" /> Inicio</Link>
              </Button>
            </div>
          </div>

          {/* Resumen de resultados */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumen de Eficiencia Energética</CardTitle>
              <CardDescription>Resultados del análisis basado en su información</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Puntuación de Eficiencia</h3>
                    <div className="mt-2 relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-primary">
                            {diagnostic.results.puntuacionEficiencia}/100
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                        <div 
                          style={{ width: `${diagnostic.results.puntuacionEficiencia}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary">
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Menor eficiencia</span>
                      <span className="text-muted-foreground">Mayor eficiencia</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Comparación con el sector</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Su consumo energético comparado con el promedio del sector:
                    </p>
                    <div className="mt-2 flex items-center">
                      <span className={`text-xl font-bold ${diagnostic.results.comparacionSector.diferenciaPorcentual > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {diagnostic.results.comparacionSector.diferenciaPorcentual > 0 ? '+' : ''}
                        {diagnostic.results.comparacionSector.diferenciaPorcentual.toFixed(1)}%
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {diagnostic.results.comparacionSector.diferenciaPorcentual > 0 
                          ? 'por encima del promedio' 
                          : 'por debajo del promedio'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Potencial de Ahorro</h3>
                    <p className="text-2xl font-bold text-primary">
                      ${diagnostic.results.potencialAhorro.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ahorro anual estimado implementando nuestras recomendaciones
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Indicadores Clave</h3>
                    <dl className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm py-1 border-b border-border/50">
                        <dt className="text-muted-foreground">Intensidad energética:</dt>
                        <dd className="font-medium">{diagnostic.results.intensidadEnergetica.toLocaleString()} kWh/unidad</dd>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-border/50">
                        <dt className="text-muted-foreground">Costo energético anual:</dt>
                        <dd className="font-medium">${diagnostic.results.costoEnergiaAnual.toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between text-sm py-1">
                        <dt className="text-muted-foreground">Consumo promedio del sector:</dt>
                        <dd className="font-medium">{diagnostic.results.comparacionSector.consumoPromedioSector.toLocaleString()} kWh/unidad</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recomendaciones Personalizadas</CardTitle>
              <CardDescription>
                Acciones específicas para mejorar su eficiencia energética
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {diagnostic.recomendaciones
                  .sort((a, b) => b.prioridad - a.prioridad)
                  .map(rec => (
                    <div key={rec.id} className="rounded-md border border-border p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {getCategoryIcon(rec.categoria)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <h3 className="font-medium text-lg">{rec.titulo}</h3>
                            <div className="flex items-center px-2 py-1 rounded text-xs bg-primary/10">
                              <span className="font-semibold">Prioridad: {rec.prioridad}/5</span>
                            </div>
                          </div>
                          <p className="mt-2 text-muted-foreground">{rec.descripcion}</p>
                          
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded bg-muted/30 p-2">
                              <div className="text-xs text-muted-foreground">Ahorro estimado</div>
                              <div className="font-semibold">${rec.ahorroEstimado.toLocaleString()}</div>
                            </div>
                            <div className="rounded bg-muted/30 p-2">
                              <div className="text-xs text-muted-foreground">Costo de implementación</div>
                              <div>{getImplementationCostLabel(rec.costoImplementacion)}</div>
                            </div>
                            <div className="rounded bg-muted/30 p-2">
                              <div className="text-xs text-muted-foreground">Período de retorno</div>
                              <div className="font-semibold">{rec.periodoRetorno} meses</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Información del diagnóstico */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Información del Diagnóstico</CardTitle>
              <CardDescription>Datos proporcionados para el análisis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Información General</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Ubicación:</dt>
                      <dd className="font-medium">{diagnostic.contactInfo.ubicacion}</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Cargo:</dt>
                      <dd className="font-medium">{diagnostic.contactInfo.cargo}</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Interés principal:</dt>
                      <dd className="font-medium">{getInterestName(diagnostic.background.mainInterest)}</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <dt className="text-muted-foreground">Auditorías previas:</dt>
                      <dd className="font-medium">{diagnostic.background.hasPreviousAudits ? 'Sí' : 'No'}</dd>
                    </div>
                  </dl>
                  
                  <h3 className="font-medium mt-4 mb-2">Producción</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Tipo de producto:</dt>
                      <dd className="font-medium">{diagnostic.production.productType}</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Exporta productos:</dt>
                      <dd className="font-medium">{diagnostic.production.exportProducts ? 'Sí' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <dt className="text-muted-foreground">Producción anual:</dt>
                      <dd className="font-medium">{diagnostic.volume.annualProduction} {diagnostic.volume.productionUnit}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Energía</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Equipo de mayor consumo:</dt>
                      <dd className="font-medium">{diagnostic.equipment.mostIntensiveEquipment}</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Consumo energético:</dt>
                      <dd className="font-medium">{diagnostic.equipment.energyConsumption.toLocaleString()} kWh</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Tarifa eléctrica:</dt>
                      <dd className="font-medium">{diagnostic.renewable.electricTariff}</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Interés en renovables:</dt>
                      <dd className="font-medium">{diagnostic.renewable.interestedInRenewable ? 'Sí' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <dt className="text-muted-foreground">% costos energéticos:</dt>
                      <dd className="font-medium">{diagnostic.volume.energyCostPercentage}%</dd>
                    </div>
                  </dl>
                  
                  <h3 className="font-medium mt-4 mb-2">Costos Energéticos</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between text-sm py-1 border-b border-border/50">
                      <dt className="text-muted-foreground">Costo electricidad:</dt>
                      <dd className="font-medium">${diagnostic.volume.energyCosts.electricity}/kWh</dd>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <dt className="text-muted-foreground">Costo combustible:</dt>
                      <dd className="font-medium">${diagnostic.volume.energyCosts.fuel}/unidad</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Botones de acción */}
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/"><ChevronLeft className="mr-2 h-4 w-4" /> Volver al inicio</Link>
            </Button>
            <Button asChild>
              <Link to="/dignostico">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Realizar nuevo diagnóstico
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticResultPage; 