import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface VolumeData {
  annualProduction: number;
  productionUnit: string;
  energyCosts: {
    electricity: number;
    fuel: number;
    others: string;
  };
  energyCostPercentage: number;
}

interface VolumeStepProps {
  data: VolumeData;
  updateData: (data: VolumeData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const VolumeStep: React.FC<VolumeStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState(data);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar si todos los campos requeridos están completos
  useEffect(() => {
    const isValid = 
      formData.annualProduction > 0 && 
      formData.productionUnit !== "" &&
      formData.energyCosts.electricity >= 0 &&
      formData.energyCosts.fuel >= 0 &&
      formData.energyCostPercentage >= 0 && 
      formData.energyCostPercentage <= 100;
    setIsFormValid(isValid);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "annualProduction" || name === "energyCostPercentage") {
      const numValue = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else if (name === "electricity" || name === "fuel") {
      const numValue = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        energyCosts: {
          ...prev.energyCosts,
          [name]: numValue,
        },
      }));
    } else if (name === "others") {
      setFormData((prev) => ({
        ...prev,
        energyCosts: {
          ...prev.energyCosts,
          others: value,
        },
      }));
    }
  };

  const handleUnitChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      productionUnit: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const productionUnits = [
    { value: "toneladas", label: "Toneladas" },
    { value: "kg", label: "Kilogramos" },
    { value: "litros", label: "Litros" },
    { value: "m3", label: "Metros cúbicos" },
    { value: "unidades", label: "Unidades" },
    { value: "cajas", label: "Cajas" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Volumen, Costos y Porcentajes</h2>
        <p className="text-muted-foreground mb-6">
          Información sobre su volumen de producción y costos energéticos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="annualProduction">
            12. ¿Cuánto volumen produjo el último año o temporada? <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id="annualProduction"
              name="annualProduction"
              type="number"
              value={formData.annualProduction || ""}
              onChange={handleInputChange}
              placeholder="Ej. 1000"
              min="0"
              required
            />
            <Select
              value={formData.productionUnit}
              onValueChange={handleUnitChange}
            >
              <SelectTrigger id="productionUnit" className="w-full">
                <SelectValue placeholder="Unidad" />
              </SelectTrigger>
              <SelectContent>
                {productionUnits.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label>
            13. ¿Cuánto fue su costo energético el último año o temporada?
          </Label>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="electricity">Electricidad ($/kWh) <span className="text-destructive">*</span></Label>
              <Input
                id="electricity"
                name="electricity"
                type="number"
                value={formData.energyCosts.electricity || ""}
                onChange={handleInputChange}
                placeholder="Ej. 120"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel">Combustible ($/m³) <span className="text-destructive">*</span></Label>
              <Input
                id="fuel"
                name="fuel"
                type="number"
                value={formData.energyCosts.fuel || ""}
                onChange={handleInputChange}
                placeholder="Ej. 800"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="others">Otros (especifique)</Label>
              <Input
                id="others"
                name="others"
                value={formData.energyCosts.others}
                onChange={handleInputChange}
                placeholder="Ej. Gas licuado: $1200/kg"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="energyCostPercentage">
            14. ¿Qué porcentaje aproximado de sus costos totales de producción corresponde a sus costos energéticos? <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="energyCostPercentage"
              name="energyCostPercentage"
              type="number"
              value={formData.energyCostPercentage || ""}
              onChange={handleInputChange}
              placeholder="Ej. 15"
              min="0"
              max="100"
              required
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
          </div>
          <p className="text-xs text-muted-foreground">Ingrese un valor entre 0 y 100</p>
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

export default VolumeStep; 