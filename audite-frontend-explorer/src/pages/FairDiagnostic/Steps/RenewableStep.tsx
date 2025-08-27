import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface RenewableData {
  interestedInRenewable: boolean;
  electricTariff: string;
  penaltiesReceived: boolean;
  penaltyCount: number;
}

interface RenewableStepProps {
  data: RenewableData;
  updateData: (data: RenewableData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const RenewableStep: React.FC<RenewableStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState(data);
  const [otherTariff, setOtherTariff] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar si todos los campos requeridos están completos
  useEffect(() => {
    const isValid = formData.electricTariff !== "";
    setIsFormValid(isValid);
  }, [formData]);

  const handleRadioChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "yes",
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      electricTariff: value,
    }));
  };

  const handlePenaltyCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      penaltyCount: count,
    }));
  };

  const handleCustomTariffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherTariff(e.target.value);
    
    if (formData.electricTariff === "otro") {
      setFormData((prev) => ({
        ...prev,
        electricTariff: "otro:" + e.target.value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const tariffOptions = [
    { value: "bt1", label: "BT1 - Tarifa residencial" },
    { value: "bt2", label: "BT2 - Potencia contratada" },
    { value: "bt3", label: "BT3 - Potencia medida" },
    { value: "bt4", label: "BT4 - Horaria" },
    { value: "bt5", label: "BT5 - Horaria con discriminación" },
    { value: "at2", label: "AT2 - Alta tensión" },
    { value: "at3", label: "AT3 - Alta tensión con medición" },
    { value: "at4", label: "AT4 - Alta tensión horaria" },
    { value: "desconocida", label: "No lo sé" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Energías Renovables y Tarifas</h2>
        <p className="text-muted-foreground mb-6">
          Cuéntenos sobre su interés en energías renovables y su situación tarifaria.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label>
            9. ¿Su Organización está actualmente interesada en la producción de energía a partir de fuentes renovables para autoconsumo y/o venta?
          </Label>
          <RadioGroup
            value={formData.interestedInRenewable ? "yes" : "no"}
            onValueChange={(value) => handleRadioChange("interestedInRenewable", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="renewable-yes" />
              <Label htmlFor="renewable-yes">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="renewable-no" />
              <Label htmlFor="renewable-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label htmlFor="electricTariff">
            10. ¿A qué tarifa eléctrica está actualmente contratado? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.electricTariff.startsWith("otro:") ? "otro" : formData.electricTariff}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger id="electricTariff" className="w-full">
              <SelectValue placeholder="Seleccione su tarifa eléctrica" />
            </SelectTrigger>
            <SelectContent>
              {tariffOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {formData.electricTariff === "otro" || formData.electricTariff.startsWith("otro:") ? (
            <div className="mt-2">
              <Input
                placeholder="Especifique su tarifa"
                value={
                  formData.electricTariff.startsWith("otro:") 
                    ? formData.electricTariff.substring(5) 
                    : otherTariff
                }
                onChange={handleCustomTariffChange}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <Label>
            11. ¿Recibe o ha recibido multas por mal uso del factor de potencia, sobreconsumo de energía reactiva y/o cargos por incumplimiento de consumos mínimos o máximos?
          </Label>
          <RadioGroup
            value={formData.penaltiesReceived ? "yes" : "no"}
            onValueChange={(value) => handleRadioChange("penaltiesReceived", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="penalties-yes" />
              <Label htmlFor="penalties-yes">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="penalties-no" />
              <Label htmlFor="penalties-no">No</Label>
            </div>
          </RadioGroup>
          
          {formData.penaltiesReceived && (
            <div className="mt-2">
              <Label htmlFor="penaltyCount">Cantidad de veces/cargos recibidos</Label>
              <Input
                id="penaltyCount"
                type="number"
                min="0"
                value={formData.penaltyCount || ""}
                onChange={handlePenaltyCountChange}
                placeholder="Ej. 3"
              />
            </div>
          )}
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

export default RenewableStep; 