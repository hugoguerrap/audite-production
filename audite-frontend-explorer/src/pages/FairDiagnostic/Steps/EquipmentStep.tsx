import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface EquipmentData {
  mostIntensiveEquipment: string;
  energyConsumption: number;
  specificEquipmentMeasured: string;
}

interface EquipmentStepProps {
  data: EquipmentData;
  updateData: (data: EquipmentData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const EquipmentStep: React.FC<EquipmentStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState(data);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar si todos los campos requeridos están completos
  useEffect(() => {
    const isValid = 
      formData.mostIntensiveEquipment !== "" && 
      formData.energyConsumption > 0;
    setIsFormValid(isValid);
  }, [formData]);

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      mostIntensiveEquipment: value,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "energyConsumption") {
      const numValue = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const equipmentOptions = [
    "Sistemas de refrigeración",
    "Sistemas de calefacción",
    "Motores eléctricos",
    "Bombas de agua",
    "Sistemas de iluminación",
    "Equipos de procesamiento",
    "Equipos de climatización",
    "Tractores y vehículos",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Equipos y Consumo Energético</h2>
        <p className="text-muted-foreground mb-6">
          Cuéntenos sobre sus equipos y el consumo energético de su organización.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label>
            6. En base a su experiencia sobre su producción; ¿cuál de los siguientes equipos y/o sistemas es el más intensivo, en términos del consumo de energía? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={formData.mostIntensiveEquipment}
            onValueChange={handleRadioChange}
            className="flex flex-col space-y-1"
          >
            {equipmentOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`equipment-${option}`} />
                <Label htmlFor={`equipment-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {!formData.mostIntensiveEquipment && (
            <p className="text-sm text-destructive">Seleccione una opción</p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="energyConsumption">
            7. ¿Cuánto fue el consumo energético del último año/temporada? (kWh) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="energyConsumption"
            name="energyConsumption"
            type="number"
            value={formData.energyConsumption || ""}
            onChange={handleInputChange}
            placeholder="Ej. 20000"
            min="0"
            required
          />
          <p className="text-xs text-muted-foreground">Ingrese el consumo en kilowatt-hora (kWh)</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="specificEquipmentMeasured">
            8. ¿Su Organización mide el consumo energético en algún equipo o sistema específico? Si lo hace, ¿en cuál?
          </Label>
          <Textarea
            id="specificEquipmentMeasured"
            name="specificEquipmentMeasured"
            value={formData.specificEquipmentMeasured}
            onChange={handleInputChange}
            placeholder="Describa si mide el consumo en algún equipo específico"
            className="min-h-[100px]"
          />
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
            type="submit"
            disabled={!isFormValid}
            className="flex items-center gap-1"
          >
            Siguiente <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentStep; 