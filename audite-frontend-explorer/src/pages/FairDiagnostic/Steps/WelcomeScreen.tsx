import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center px-4">
        <h1 className="text-3xl font-bold mb-6">Diagnóstico Energético General</h1>
        <div className="prose max-w-none text-muted-foreground">
          <p className="text-base">
            La Auditoría Energética (AE) o Diagnóstico Energético, es una revisión, análisis y comprensión del uso 
            y consumo de energía de las instalaciones que permiten identificar medidas de eficiencia energética, 
            que representen oportunidades para mejorar el desempeño energético de una empresa, industria u organización.
          </p>
          <p className="text-base">
            Este diagnóstico energético tiene por finalidad identificar de forma general los usos y consumos 
            energéticos de su organización, para poder entregarle potenciales ahorros de costos asociados a un 
            uso más eficiente de la energía, y en consecuencia, describir el potencial impacto que estos tendrían 
            en el estado de resultados de su empresa.
          </p>
          <p className="text-base font-medium">
            ¡Está a un paso de comenzar su Diagnóstico Energético por lo que agradecemos su sinceridad en las respuestas! 
            Sólo le tomará 5 minutos.
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <Button size="lg" onClick={onNext} className="px-8">
          Comenzar <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen; 