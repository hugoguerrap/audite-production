import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ContactData {
  ubicacion: string;
  cargo: string;
  nombre_completo: string;
  telefono?: string;
  email_contacto?: string;
  nombre_empresa_contacto?: string;
}

interface ContactStepProps {
  data: ContactData;
  updateData: (data: ContactData) => void;
  onNext: (data: ContactData) => void;
  onPrev: () => void;
}

const ContactStep: React.FC<ContactStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState(data);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validar si todos los campos requeridos están completos
  useEffect(() => {
    const isValid =
      formData.ubicacion.trim() !== "" &&
      formData.cargo.trim() !== "" &&
      formData.nombre_completo.trim() !== "";
    setIsFormValid(isValid);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Datos de Contacto</h2>
        <p className="text-muted-foreground mb-6">
          Por favor ingrese la información solicitada para continuar con el diagnóstico.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre_completo">Nombre Completo <span className="text-destructive">*</span></Label>
          <Input
            id="nombre_completo"
            name="nombre_completo"
            value={formData.nombre_completo || ""}
            onChange={handleChange}
            placeholder="Ej. Ana García"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo <span className="text-destructive">*</span></Label>
          <Input
            id="cargo"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            placeholder="Ej. Gerente de Operaciones"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ubicacion">Ubicación <span className="text-destructive">*</span></Label>
          <Input
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Ej. Lima, Perú"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            name="telefono"
            value={formData.telefono || ""}
            onChange={handleChange}
            placeholder="Ej. +51987654321"
            type="tel"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_contacto">Email de Contacto</Label>
          <Input
            id="email_contacto"
            name="email_contacto"
            value={formData.email_contacto || ""}
            onChange={handleChange}
            placeholder="Ej. ana.garcia@empresa.com"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre_empresa_contacto">Nombre de Empresa (Contacto)</Label>
          <Input
            id="nombre_empresa_contacto"
            name="nombre_empresa_contacto"
            value={formData.nombre_empresa_contacto || ""}
            onChange={handleChange}
            placeholder="Ej. Empresa Ejemplo SAC"
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

export default ContactStep; 