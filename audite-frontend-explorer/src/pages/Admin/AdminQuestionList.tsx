import React from 'react';
import { AdminPregunta } from '@/hooks/useAdminQuestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Power,
  PowerOff
} from 'lucide-react';
import { TableCell } from '@/components/ui/table';

interface AdminQuestionListProps {
  preguntas: AdminPregunta[];
  onEdit: (pregunta: AdminPregunta) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, activa: boolean) => void;
}

const AdminQuestionList: React.FC<AdminQuestionListProps> = ({
  preguntas,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const getTipoLabel = (tipo: string) => {
    const tipos = {
      'radio': 'Opción Única',
      'checkbox': 'Múltiple Selección',
      'text': 'Texto Libre',
      'number': 'Número',
      'select': 'Lista Desplegable'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoBadgeVariant = (tipo: string): "default" | "secondary" | "outline" | "destructive" => {
    const variants = {
      'radio': 'default' as const,
      'checkbox': 'secondary' as const,
      'text': 'outline' as const,
      'number': 'destructive' as const,
      'select': 'default' as const
    };
    return variants[tipo as keyof typeof variants] || 'default';
  };

  if (preguntas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay preguntas configuradas</p>
            <p className="text-sm text-muted-foreground mt-2">
              Haz clic en "Nueva Pregunta" para comenzar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {preguntas
        .sort((a, b) => a.numero_orden - b.numero_orden)
        .map((pregunta) => (
          <Card key={pregunta.id} className={`${!pregunta.es_activa ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-xs">
                      #{pregunta.numero_orden}
                    </Badge>
                    <Badge variant={getTipoBadgeVariant(pregunta.tipo_respuesta)}>
                      {getTipoLabel(pregunta.tipo_respuesta)}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pregunta.es_activa}
                        onCheckedChange={(checked) => onToggleActive(pregunta.id, checked)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {pregunta.es_activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-relaxed">
                    {pregunta.pregunta}
                  </CardTitle>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(pregunta)}
                    title="Editar pregunta"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(pregunta.id)}
                    title="Eliminar pregunta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {pregunta.opciones && pregunta.opciones.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Opciones disponibles:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pregunta.opciones
                      .sort((a, b) => a.orden - b.orden)
                      .map((opcion) => (
                        <div
                          key={opcion.id}
                          className={`text-sm p-2 rounded border ${
                            opcion.es_especial
                              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                              : 'bg-muted/50'
                          }`}
                        >
                          <span className="font-mono text-xs text-muted-foreground mr-2">
                            {opcion.orden}.
                          </span>
                          {opcion.texto_opcion}
                          {opcion.es_especial && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Especial
                            </Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
    </div>
  );
};

export default AdminQuestionList; 