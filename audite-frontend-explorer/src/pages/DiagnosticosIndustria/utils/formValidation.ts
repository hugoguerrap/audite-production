/**
 * Utilidades para validación de formularios dinámicos
 * Funciones helper para validar respuestas y campos
 */

import { ErrorValidacion, PreguntaFormulario, TipoPregunta } from '@/types/industria';

/**
 * Valida una respuesta individual según el tipo de pregunta
 */
export const validarRespuesta = (
  pregunta: PreguntaFormulario,
  valor: any,
  valorOtro?: string
): ErrorValidacion[] => {
  console.log('formValidation - validarRespuesta:', { pregunta: pregunta.id, valor, valorOtro });
  
  const errores: ErrorValidacion[] = [];
  
  // Validación de campo requerido
  if (pregunta.requerida && !valor && !valorOtro) {
    errores.push({
      campo: `pregunta_${pregunta.id}`,
      mensaje: 'Este campo es requerido',
      codigo: 'REQUIRED'
    });
  }
  
  // TODO: Implementar validaciones específicas por tipo
  switch (pregunta.tipo) {
    case 'text':
      // Validar longitud, caracteres especiales, etc.
      break;
    case 'number':
      // Validar que sea número, rangos, etc.
      break;
    case 'email':
      // Validar formato de email
      break;
    case 'tel':
      // Validar formato de teléfono
      break;
    // ... otros tipos
  }
  
  return errores;
};

/**
 * Valida todas las respuestas de un formulario
 */
export const validarFormulario = (
  preguntas: PreguntaFormulario[],
  respuestas: Record<number, any>,
  camposOtro: Record<number, string>
): ErrorValidacion[] => {
  console.log('formValidation - validarFormulario: Pendiente de implementación');
  
  const errores: ErrorValidacion[] = [];
  
  // TODO: Implementar validación completa
  // - Validar cada pregunta visible
  // - Validar campos "Otro" requeridos
  // - Validar dependencias condicionales
  // - Validar integridad de datos
  
  return errores;
};

/**
 * Valida un campo "Otro" específico
 */
export const validarCampoOtro = (
  preguntaId: number,
  valor: string,
  requerido: boolean = false,
  longitudMinima: number = 0,
  longitudMaxima: number = 500
): ErrorValidacion[] => {
  console.log('formValidation - validarCampoOtro:', { preguntaId, valor, requerido });
  
  const errores: ErrorValidacion[] = [];
  
  if (requerido && !valor.trim()) {
    errores.push({
      campo: `otro_${preguntaId}`,
      mensaje: 'Por favor especifica tu respuesta',
      codigo: 'OTRO_REQUIRED'
    });
  }
  
  if (valor.length < longitudMinima) {
    errores.push({
      campo: `otro_${preguntaId}`,
      mensaje: `Debe tener al menos ${longitudMinima} caracteres`,
      codigo: 'MIN_LENGTH'
    });
  }
  
  if (valor.length > longitudMaxima) {
    errores.push({
      campo: `otro_${preguntaId}`,
      mensaje: `No puede exceder ${longitudMaxima} caracteres`,
      codigo: 'MAX_LENGTH'
    });
  }
  
  return errores;
};

/**
 * Valida formato de email
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de teléfono
 */
export const validarTelefono = (telefono: string): boolean => {
  // Formato básico para números de teléfono
  const telefonoRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
  return telefonoRegex.test(telefono);
};

/**
 * Valida que un número esté en un rango específico
 */
export const validarRangoNumerico = (
  valor: number,
  minimo?: number,
  maximo?: number
): boolean => {
  if (minimo !== undefined && valor < minimo) return false;
  if (maximo !== undefined && valor > maximo) return false;
  return true;
};

/**
 * Sanitiza y limpia un valor de texto
 */
export const sanitizarTexto = (texto: string): string => {
  return texto.trim()
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno
    .replace(/[<>]/g, ''); // Remover caracteres potencialmente peligrosos
};

/**
 * Valida la completitud del formulario
 */
export const esFormularioCompleto = (
  preguntasVisibles: PreguntaFormulario[],
  respuestas: Record<number, any>
): boolean => {
  console.log('formValidation - esFormularioCompleto: Pendiente de implementación');
  
  // TODO: Implementar validación de completitud
  // - Verificar que todas las preguntas requeridas tienen respuesta
  // - Verificar campos "Otro" completados
  // - Verificar validaciones específicas por tipo
  
  return true;
};

/**
 * Calcula el porcentaje de completitud del formulario
 */
export const calcularPorcentajeCompletitud = (
  preguntasVisibles: PreguntaFormulario[],
  respuestas: Record<number, any>
): number => {
  if (preguntasVisibles.length === 0) return 0;
  
  const preguntasRespondidas = preguntasVisibles.filter(p => 
    respuestas[p.id] !== undefined && respuestas[p.id] !== null && respuestas[p.id] !== ''
  ).length;
  
  return Math.round((preguntasRespondidas / preguntasVisibles.length) * 100);
};

/**
 * Obtiene mensajes de error amigables para el usuario
 */
export const obtenerMensajeErrorAmigable = (error: ErrorValidacion): string => {
  const mensajesAmigables: Record<string, string> = {
    'REQUIRED': 'Este campo es obligatorio',
    'OTRO_REQUIRED': 'Por favor especifica tu respuesta en "Otro"',
    'MIN_LENGTH': 'El texto es demasiado corto',
    'MAX_LENGTH': 'El texto es demasiado largo',
    'INVALID_EMAIL': 'Por favor ingresa un email válido',
    'INVALID_PHONE': 'Por favor ingresa un teléfono válido',
    'INVALID_NUMBER': 'Por favor ingresa un número válido',
    'OUT_OF_RANGE': 'El valor está fuera del rango permitido'
  };
  
  return mensajesAmigables[error.codigo || ''] || error.mensaje;
}; 