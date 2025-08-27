import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WelcomeScreen from "./Steps/WelcomeScreen";
import ContactStep from "./Steps/ContactStep";
import BackgroundStep from "./Steps/BackgroundStep";
import ProductionStep from "./Steps/ProductionStep";
import EquipmentStep from "./Steps/EquipmentStep";
import RenewableStep from "./Steps/RenewableStep";
import VolumeStep from "./Steps/VolumeStep";
import ReviewStep from "./Steps/ReviewStep";
import ThankYouStep from "./Steps/ThankYouStep";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { feriaService } from "@/lib/legacyApi";
import type { 
  FairContactInfoPayload, 
  FairIniciarContactoResponse, 
  FairDiagnosticoResponse,
  FairDiagnosticoCompletarRequest
} from "@/types/api";

// La interfaz DiagnosticResults ahora es un alias o usa directamente FairDiagnosticoResponse
// Ya no se define localmente, o se define como: type DiagnosticResults = FairDiagnosticoResponse;
// Para este cambio, simplemente usaremos FairDiagnosticoResponse directamente para el estado.

const EnergyDiagnostic = () => {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Usar FairDiagnosticoResponse directamente para el estado de los resultados
  const [diagnosticResults, setDiagnosticResults] = useState<FairDiagnosticoResponse | null>(null);
  // Inicializar diagnosticMeta con lo que viene de location.state si está disponible
  const [diagnosticMeta, setDiagnosticMeta] = useState<FairIniciarContactoResponse | null>(
    location.state?.diagnosticMeta || null
  );
  
  // Estado para indicar si estamos continuando un diagnóstico pendiente
  const [isPendingDiagnostic, setIsPendingDiagnostic] = useState<boolean>(
    location.state?.isPendingDiagnostic || false
  );
  
  // Estado para almacenar los datos del formulario completo
  const [formData, setFormData] = useState({
    contactInfo: {
      ubicacion: "",
      cargo: "",
      nombre_completo: "",
      telefono: "",
      email_contacto: "",
      nombre_empresa_contacto: "",
    } as FairContactInfoPayload,
    background: {
      hasPreviousAudits: false,
      mainInterest: "",
    },
    production: {
      productType: "",
      exportProducts: false,
      processesOfInterest: [],
    },
    equipment: {
      mostIntensiveEquipment: "",
      energyConsumption: 0,
      specificEquipmentMeasured: "",
    },
    renewable: {
      interestedInRenewable: false,
      electricTariff: "",
      penaltiesReceived: false,
      penaltyCount: 0,
    },
    volume: {
      annualProduction: 0,
      productionUnit: "",
      energyCosts: {
        electricity: 0,
        fuel: 0,
        others: "",
      },
      energyCostPercentage: 0,
    },
    metadata: {
      browser: getBrowserInfo(),
      deviceType: getDeviceType(),
      fairLocation: "Feria Tecnológica de Energía",
      fairName: "ExpoDiagnóstico 2023"
    }
  });

  // Efecto para cargar datos de diagnóstico pendiente si tenemos un código de acceso
  useEffect(() => {
    // Si hay un diagnosticMeta (con accessCode) desde la navegación, 
    // pero no tenemos los datos del diagnóstico, intentamos obtenerlos
    const fetchPendingDiagnostic = async () => {
      if (diagnosticMeta?.accessCode && !diagnosticResults) {
        try {
          console.log("Cargando diagnóstico pendiente con código:", diagnosticMeta.accessCode);
          const diagnostic = await feriaService.getDiagnosticoByCode(diagnosticMeta.accessCode);
          
          // Si el diagnóstico tiene contactInfo, actualizamos ese estado
          if (diagnostic.contactInfo) {
            console.log("Datos de contacto cargados:", diagnostic.contactInfo);
            setFormData(prev => ({
              ...prev,
              contactInfo: diagnostic.contactInfo
            }));
            
            // Si es un diagnóstico pendiente (sólo tiene contactInfo y no resultados)
            // o si venimos explícitamente marcados como un diagnóstico pendiente
            if (!diagnostic.results || isPendingDiagnostic) {
              console.log("Redirigiendo al paso 3 (Background)");
              // Aseguramos que se va al paso de Background (saltamos bienvenida y contacto)
              setCurrentStep(3); 
              // También aseguramos que isPendingDiagnostic está en true
              if (!isPendingDiagnostic) setIsPendingDiagnostic(true);
            }
          }
        } catch (error) {
          console.error("Error al cargar diagnóstico pendiente:", error);
          toast.error("No se pudo cargar el diagnóstico pendiente.");
        }
      }
    };
    
    fetchPendingDiagnostic();
  }, [diagnosticMeta?.accessCode, isPendingDiagnostic]);

  // Función para detectar el navegador
  function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = "Desconocido";
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    }
    
    return browserName;
  }

  // Función para detectar el tipo de dispositivo
  function getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) {
      return "mobile";
    } else if (/iPad|Tablet/i.test(userAgent)) {
      return "tablet";
    } else {
      return "desktop";
    }
  }

  // Función para actualizar el estado del formulario
  const updateFormData = (step: string, data: any) => {
    setFormData(prevData => {
      if (step === "contactInfo") {
        return {
          ...prevData,
          contactInfo: { ...prevData.contactInfo, ...data } as FairContactInfoPayload
        };
      }
      return {
        ...prevData,
        [step]: {
          ...prevData[step],
          ...data
        }
      };
    });
    window.scrollTo(0, 0);
  };

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  // Función para retroceder al paso anterior
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Nueva función para manejar el envío de la información de contacto (Etapa 1)
  const handleContactSubmit = async (contactData: FairContactInfoPayload) => {
    setIsSubmitting(true);
    updateFormData("contactInfo", contactData);
    try {
      const response: FairIniciarContactoResponse = await feriaService.iniciarDiagnosticoContacto(contactData);
      setDiagnosticMeta({ id: response.id, accessCode: response.accessCode });
      
      toast.success("Contacto guardado. Código de acceso: " + response.accessCode);
      nextStep();
    } catch (error) {
      console.error("Error al iniciar el diagnóstico:", error);
      toast.error("Hubo un problema al guardar la información de contacto. Inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar el envío final del formulario (Etapa 2)
  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!diagnosticMeta || !diagnosticMeta.accessCode) {
      toast.error("Error: No se encontró el código de acceso para completar el diagnóstico.");
      setIsSubmitting(false);
      return;
    }

    // Preparar el payload para completar el diagnóstico
    const { contactInfo, ...datosParaCompletar } = formData;
    const payload: FairDiagnosticoCompletarRequest = {
      background: datosParaCompletar.background,
      production: datosParaCompletar.production,
      equipment: datosParaCompletar.equipment,
      renewable: datosParaCompletar.renewable,
      volume: datosParaCompletar.volume,
      metadata: datosParaCompletar.metadata, // metadata es opcional en el tipo, se envía si existe
    };
    
    try {
      const response = await feriaService.completarDiagnostico(diagnosticMeta.accessCode, payload);
      
      setDiagnosticResults(response); 
      
      toast.success("Diagnóstico completado y enviado con éxito.");
      
      nextStep(); // Avanzar a la pantalla de agradecimiento
    } catch (error) {
      console.error("Error al completar el diagnóstico:", error);
      toast.error("Hubo un problema al completar el diagnóstico. Inténtelo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para saltar a un paso específico (usado para editar desde el resumen)
  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  // Renderizar el paso actual basado en el estado
  const renderStep = () => {
    // Verificación de seguridad: Si es el paso final (9) pero no tenemos resultados, 
    // llevamos de vuelta al paso de revisión (8) para completar el formulario
    if (currentStep === 9 && !diagnosticResults?.results) {
      // Solo ponemos un log para depuración y no mostramos mensaje al usuario para evitar confusión
      console.warn("Se intentó acceder al paso final sin resultados completos, redirigiendo al paso de revisión");
      setTimeout(() => setCurrentStep(8), 0); // Usamos setTimeout para evitar problemas de render
      return null; // Devolvemos null mientras se redirige
    }
    
    switch (currentStep) {
      case 1:
        return <WelcomeScreen onNext={nextStep} />;
      case 2:
        return (
          <ContactStep
            data={formData.contactInfo}
            updateData={(data) => updateFormData("contactInfo", data)}
            onNext={handleContactSubmit}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <BackgroundStep
            data={formData.background}
            updateData={(data) => updateFormData("background", data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <ProductionStep
            data={formData.production}
            updateData={(data) => updateFormData("production", data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <EquipmentStep
            data={formData.equipment}
            updateData={(data) => updateFormData("equipment", data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 6:
        return (
          <RenewableStep
            data={formData.renewable}
            updateData={(data) => updateFormData("renewable", data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 7:
        return (
          <VolumeStep
            data={formData.volume}
            updateData={(data) => updateFormData("volume", data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 8:
        return (
          <ReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onEdit={goToStep}
            onPrev={prevStep}
            isSubmitting={isSubmitting}
          />
        );
      case 9:
        return <ThankYouStep results={diagnosticResults} />;
      default:
        return <WelcomeScreen onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary/10 pb-4">
            {/* Logo de AuditE en el diagnóstico */}
            <div className="flex justify-center mb-8">
              <img 
                src="/logo primary@2x.png" 
                alt="AuditE - Conecta. Ahorra. Transforma." 
                className="h-32 w-auto object-contain"
                style={{ maxWidth: '500px' }}
              />
            </div>
            
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Diagnóstico Energético General
            </CardTitle>
            {currentStep > 1 && currentStep < 9 && (
              <div className="flex justify-center mt-2">
                <div className="text-muted-foreground text-sm">
                  Paso {currentStep - 1} de 8
                </div>
              </div>
            )}
            
            {/* Mostrar el código de acceso cuando esté disponible */}
            {diagnosticMeta && diagnosticMeta.accessCode && (
              <div className="flex flex-col items-center justify-center mt-4 bg-muted p-3 rounded-md">
                <div className="text-sm text-muted-foreground mb-1">
                  Su código de acceso (guárdelo para continuar en otro momento):
                </div>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-primary text-lg">{diagnosticMeta.accessCode}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(diagnosticMeta.accessCode);
                      toast.success("Código copiado al portapapeles");
                    }}
                    className="h-7 px-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnergyDiagnostic; 