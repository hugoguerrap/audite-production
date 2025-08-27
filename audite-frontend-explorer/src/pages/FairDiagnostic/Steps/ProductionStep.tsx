import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProductionData {
  productType: string;
  exportProducts: boolean;
  processesOfInterest: string[];
}

interface ProductionStepProps {
  data: ProductionData;
  updateData: (data: ProductionData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ProductionStep: React.FC<ProductionStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState(data);
  const [otherProductType, setOtherProductType] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar si todos los campos requeridos están completos
  useEffect(() => {
    const isValid = formData.productType !== "" && formData.processesOfInterest.length > 0;
    setIsFormValid(isValid);
  }, [formData]);

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      exportProducts: value === "yes",
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      productType: value,
    }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData((prev) => {
      const currentProcesses = [...prev.processesOfInterest];
      const index = currentProcesses.indexOf(value);
      
      if (index >= 0) {
        currentProcesses.splice(index, 1);
      } else {
        currentProcesses.push(value);
      }
      
      return {
        ...prev,
        processesOfInterest: currentProcesses,
      };
    });
  };

  const handleCustomProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherProductType(e.target.value);
    
    if (formData.productType === "otro") {
      setFormData((prev) => ({
        ...prev,
        productType: "otro:" + e.target.value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const productTypes = [
    { value: "frutas", label: "Frutas (manzanas, uvas, cítricos, etc.)" },
    { value: "hortalizas", label: "Hortalizas (tomates, lechugas, etc.)" },
    { value: "cereales", label: "Cereales (trigo, maíz, arroz)" },
    { value: "lacteos", label: "Lácteos y derivados" },
    { value: "carnes", label: "Carnes y derivados" },
    { value: "vino", label: "Vino y bebidas alcohólicas" },
    { value: "otro", label: "Otro" },
  ];

  const processes = [
    { value: "cultivo", label: "Cultivo y cosecha" },
    { value: "refrigeracion", label: "Refrigeración y almacenamiento" },
    { value: "procesamiento", label: "Procesamiento primario" },
    { value: "envasado", label: "Envasado y empaquetado" },
    { value: "distribucion", label: "Distribución y logística" },
    { value: "riego", label: "Sistemas de riego" },
    { value: "iluminacion", label: "Iluminación de instalaciones" },
    { value: "climatizacion", label: "Climatización" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Producción y Procesos</h2>
        <p className="text-muted-foreground mb-6">
          Cuéntenos sobre sus productos y procesos de producción.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="productType">
            3. ¿Qué tipo de productos produce y/o cosecha su organización? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.productType.startsWith("otro:") ? "otro" : formData.productType}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger id="productType" className="w-full">
              <SelectValue placeholder="Seleccione el tipo de producto" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {formData.productType === "otro" || formData.productType.startsWith("otro:") ? (
            <div className="mt-2">
              <Input
                placeholder="Especifique su producto"
                value={
                  formData.productType.startsWith("otro:") 
                    ? formData.productType.substring(5) 
                    : otherProductType
                }
                onChange={handleCustomProductChange}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <Label>
            4. ¿Exportan estos productos?
          </Label>
          <RadioGroup
            value={formData.exportProducts ? "yes" : "no"}
            onValueChange={handleRadioChange}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="export-yes" />
              <Label htmlFor="export-yes">Sí</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="export-no" />
              <Label htmlFor="export-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>
            5. ¿Para qué proceso en su producción le gustaría recibir un diagnóstico energético general? <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {processes.map((process) => (
              <div key={process.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`process-${process.value}`}
                  checked={formData.processesOfInterest.includes(process.value)}
                  onCheckedChange={() => handleCheckboxChange(process.value)}
                />
                <Label htmlFor={`process-${process.value}`}>{process.label}</Label>
              </div>
            ))}
          </div>
          {formData.processesOfInterest.length === 0 && (
            <p className="text-sm text-destructive">Seleccione al menos un proceso</p>
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

export default ProductionStep; 