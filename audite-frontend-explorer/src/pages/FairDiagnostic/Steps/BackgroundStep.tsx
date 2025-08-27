import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface BackgroundData {
  hasPreviousAudits: boolean;
  mainInterest: string;
}

interface BackgroundStepProps {
  data: BackgroundData;
  updateData: (data: BackgroundData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BackgroundStep: React.FC<BackgroundStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState(data);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar si todos los campos requeridos están completos
  useEffect(() => {
    const isValid = formData.mainInterest !== "";
    setIsFormValid(isValid);
  }, [formData]);

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      hasPreviousAudits: value === "yes",
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      mainInterest: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const interesOptions = [
    { value: "reduccion_costos", label: "Reducción de costos" },
    { value: "cumplimiento_normativo", label: "Cumplimiento normativo" },
    { value: "sostenibilidad", label: "Sostenibilidad" },
    { value: "certificacion", label: "Obtener certificaciones" },
    { value: "informacion", label: "Obtener información actualizada" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Antecedentes</h2>
        <p className="text-muted-foreground mb-6">
          Nos gustaría conocer su experiencia previa con auditorías energéticas y sus principales intereses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label>
            1. ¿Su Organización ha realizado o encargado otros diagnósticos o auditorías energéticas?
          </Label>
          <RadioGroup
            value={formData.hasPreviousAudits ? "yes" : "no"}
            onValueChange={handleRadioChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="previousAudit-yes" />
              <Label htmlFor="previousAudit-yes">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="previousAudit-no" />
              <Label htmlFor="previousAudit-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label htmlFor="mainInterest">
            2. ¿Cuál es su principal interés en realizar este diagnóstico energético general para su empresa? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.mainInterest}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger id="mainInterest" className="w-full">
              <SelectValue placeholder="Seleccione su interés principal" />
            </SelectTrigger>
            <SelectContent>
              {interesOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

export default BackgroundStep; 