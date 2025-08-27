import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Edit, Loader2 } from "lucide-react";

interface ReviewStepProps {
  formData: any;
  onSubmit: () => void;
  onPrev: () => void;
  onEdit: (step: number) => void;
  isSubmitting: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  formData, 
  onSubmit, 
  onPrev, 
  onEdit,
  isSubmitting 
}) => {
  // Función para formatear booleanos
  const formatBoolean = (value: boolean) => value ? "Sí" : "No";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Revisión y Envío</h2>
        <p className="text-muted-foreground mb-6">
          Por favor revise la información proporcionada. Puede editarla volviendo a la sección correspondiente.
        </p>
      </div>

      <div className="space-y-4">
        {/* Datos de Contacto */}
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Datos de Contacto</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="h-8 px-2 text-primary"
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
          </CardHeader>
          <CardContent className="py-3 px-4 text-sm">
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ubicación:</dt>
                <dd className="font-medium">{formData.contactInfo.ubicacion}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cargo:</dt>
                <dd className="font-medium">{formData.contactInfo.cargo}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Antecedentes */}
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Antecedentes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
              className="h-8 px-2 text-primary"
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
          </CardHeader>
          <CardContent className="py-3 px-4 text-sm">
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">¿Ha realizado auditorías previas?:</dt>
                <dd className="font-medium">{formatBoolean(formData.background.hasPreviousAudits)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Interés principal:</dt>
                <dd className="font-medium">{
                  {
                    "reduccion_costos": "Reducción de costos",
                    "cumplimiento_normativo": "Cumplimiento normativo",
                    "sostenibilidad": "Sostenibilidad", 
                    "certificacion": "Obtener certificaciones",
                    "informacion": "Obtener información actualizada",
                  }[formData.background.mainInterest] || formData.background.mainInterest
                }</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Producción y Procesos */}
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Producción y Procesos</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(4)}
              className="h-8 px-2 text-primary"
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
          </CardHeader>
          <CardContent className="py-3 px-4 text-sm">
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tipo de productos:</dt>
                <dd className="font-medium">{
                  formData.production.productType.startsWith("otro:") 
                    ? formData.production.productType.substring(5) 
                    : formData.production.productType
                }</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">¿Exporta productos?:</dt>
                <dd className="font-medium">{formatBoolean(formData.production.exportProducts)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-muted-foreground">Procesos de interés:</dt>
                <dd className="font-medium">
                  <ul className="list-disc list-inside">
                    {formData.production.processesOfInterest.map((process: string) => (
                      <li key={process}>{process}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Equipos y Consumo */}
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Equipos y Consumo Energético</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(5)}
              className="h-8 px-2 text-primary"
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
          </CardHeader>
          <CardContent className="py-3 px-4 text-sm">
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Equipo más intensivo:</dt>
                <dd className="font-medium">{formData.equipment.mostIntensiveEquipment}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Consumo energético anual:</dt>
                <dd className="font-medium">{formData.equipment.energyConsumption} kWh</dd>
              </div>
              {formData.equipment.specificEquipmentMeasured && (
                <div className="flex flex-col">
                  <dt className="text-muted-foreground">Equipos con medición:</dt>
                  <dd className="font-medium">{formData.equipment.specificEquipmentMeasured}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Energías Renovables */}
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Energías Renovables y Tarifas</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(6)}
              className="h-8 px-2 text-primary"
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
          </CardHeader>
          <CardContent className="py-3 px-4 text-sm">
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Interés en energías renovables:</dt>
                <dd className="font-medium">{formatBoolean(formData.renewable.interestedInRenewable)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tarifa eléctrica:</dt>
                <dd className="font-medium">{
                  formData.renewable.electricTariff.startsWith("otro:") 
                    ? formData.renewable.electricTariff.substring(5) 
                    : formData.renewable.electricTariff
                }</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">¿Recibe multas?:</dt>
                <dd className="font-medium">{formatBoolean(formData.renewable.penaltiesReceived)}</dd>
              </div>
              {formData.renewable.penaltiesReceived && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cantidad de multas:</dt>
                  <dd className="font-medium">{formData.renewable.penaltyCount}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Volumen y Costos */}
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Volumen, Costos y Porcentajes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(7)}
              className="h-8 px-2 text-primary"
            >
              <Edit className="h-4 w-4 mr-1" /> Editar
            </Button>
          </CardHeader>
          <CardContent className="py-3 px-4 text-sm">
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Volumen anual:</dt>
                <dd className="font-medium">{formData.volume.annualProduction} {formData.volume.productionUnit}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Costo electricidad:</dt>
                <dd className="font-medium">${formData.volume.energyCosts.electricity}/kWh</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Costo combustible:</dt>
                <dd className="font-medium">${formData.volume.energyCosts.fuel}/m³</dd>
              </div>
              {formData.volume.energyCosts.others && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Otros costos:</dt>
                  <dd className="font-medium">{formData.volume.energyCosts.others}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Porcentaje de costos energéticos:</dt>
                <dd className="font-medium">{formData.volume.energyCostPercentage}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Atrás
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" /> Enviando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1" /> Enviar Diagnóstico
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep; 