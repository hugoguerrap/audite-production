import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import { 
  GripVertical, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { ProcessOrderItem, OrderingResponse } from '@/types/autodiagnostico';

interface ProcessOrderingComponentProps {
  selectedProcesses: string[]; // Procesos seleccionados en la pregunta 5
  value?: OrderingResponse;
  onChange: (value: OrderingResponse) => void;
  className?: string;
}

const ProcessOrderingComponent: React.FC<ProcessOrderingComponentProps> = ({
  selectedProcesses,
  value,
  onChange,
  className = ''
}) => {
  const [processes, setProcesses] = useState<ProcessOrderItem[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Inicializar procesos cuando cambian los procesos seleccionados
  useEffect(() => {
    if (selectedProcesses.length > 0) {
      const initialProcesses: ProcessOrderItem[] = selectedProcesses.map((process, index) => ({
        id: `process-${index}`,
        name: process,
        percentage: 0,
        order: index
      }));
      
      setProcesses(initialProcesses);
      setTotalPercentage(0);
    }
  }, [selectedProcesses]); // Removí 'value' para evitar bucle infinito

  // Efecto separado para restaurar valor previo solo una vez
  useEffect(() => {
    if (value?.ordered_processes && selectedProcesses.length > 0) {
      const existingProcesses = value.ordered_processes.filter(p => 
        selectedProcesses.includes(p.name)
      );
      
      if (existingProcesses.length > 0) {
        // Combinar procesos existentes con nuevos
        const updatedProcesses = selectedProcesses.map((processName, index) => {
          const existing = existingProcesses.find(p => p.name === processName);
          return existing || {
            id: `process-${index}`,
            name: processName,
            percentage: 0,
            order: index
          };
        });
        
        setProcesses(updatedProcesses);
        setTotalPercentage(value.total_percentage || 0);
      }
    }
  }, []); // Solo ejecutar una vez al montar

  const calculateTotal = (processList: ProcessOrderItem[]) => {
    const total = processList.reduce((sum, process) => sum + (process.percentage || 0), 0);
    setTotalPercentage(total);
    
    // Validaciones
    const newErrors: string[] = [];
    if (total > 100) {
      newErrors.push('La suma de porcentajes no puede exceder 100%');
    }
    if (total < 100 && processList.some(p => p.percentage > 0)) {
      newErrors.push('La suma de porcentajes debe ser exactamente 100%');
    }
    
    setErrors(newErrors);
    
    // Emitir cambios
    const response: OrderingResponse = {
      ordered_processes: processList,
      total_percentage: total
    };
    onChange(response);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newProcesses = Array.from(processes);
    const [reorderedItem] = newProcesses.splice(result.source.index, 1);
    newProcesses.splice(result.destination.index, 0, reorderedItem);

    // Actualizar orden
    const updatedProcesses = newProcesses.map((process, index) => ({
      ...process,
      order: index
    }));

    setProcesses(updatedProcesses);
    calculateTotal(updatedProcesses);
  };

  const handlePercentageChange = (processId: string, percentage: number) => {
    const updatedProcesses = processes.map(process => 
      process.id === processId 
        ? { ...process, percentage: Math.max(0, Math.min(100, percentage)) }
        : process
    );
    
    setProcesses(updatedProcesses);
    calculateTotal(updatedProcesses);
  };

  const moveProcess = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === processes.length - 1)
    ) {
      return;
    }

    const newProcesses = [...processes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newProcesses[index], newProcesses[targetIndex]] = 
    [newProcesses[targetIndex], newProcesses[index]];

    const updatedProcesses = newProcesses.map((process, idx) => ({
      ...process,
      order: idx
    }));

    setProcesses(updatedProcesses);
    calculateTotal(updatedProcesses);
  };

  const getPercentageColor = () => {
    if (totalPercentage === 100) return 'text-green-600';
    if (totalPercentage > 100) return 'text-red-600';
    return 'text-orange-600';
  };

  const getPercentageBadgeVariant = () => {
    if (totalPercentage === 100) return 'default';
    if (totalPercentage > 100) return 'destructive';
    return 'secondary';
  };

  if (selectedProcesses.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Primero debes seleccionar procesos en la pregunta anterior para poder ordenarlos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ordena los procesos por consumo energético</span>
            <Badge variant={getPercentageBadgeVariant()} className="ml-2">
              {totalPercentage}% / 100%
              {totalPercentage === 100 && <CheckCircle className="h-3 w-3 ml-1" />}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Arrastra los procesos para ordenarlos de <strong>mayor a menor</strong> consumo energético.
              Luego asigna un porcentaje aproximado a cada uno. Los porcentajes deben sumar exactamente 100%.
            </p>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="processes">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {processes.map((process, index) => (
                      <Draggable 
                        key={process.id} 
                        draggableId={process.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              flex items-center space-x-3 p-3 border rounded-lg bg-card
                              ${snapshot.isDragging ? 'shadow-lg border-primary' : 'hover:bg-accent'}
                              transition-all duration-200
                            `}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              
                              <div className="flex flex-col space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveProcess(index, 'up')}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveProcess(index, 'down')}
                                  disabled={index === processes.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  #{index + 1}
                                </Badge>
                                <span className="font-medium">{process.name}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`percentage-${process.id}`} className="text-sm">
                                %:
                              </Label>
                              <Input
                                id={`percentage-${process.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={process.percentage || ''}
                                onChange={(e) => handlePercentageChange(
                                  process.id, 
                                  parseFloat(e.target.value) || 0
                                )}
                                className="w-20"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Resumen */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className={`font-bold ${getPercentageColor()}`}>
                  {totalPercentage}%
                </span>
              </div>
            </div>

            {/* Errores */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessOrderingComponent; 