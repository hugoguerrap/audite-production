// URL base para la API - usar variable de entorno o fallback
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:18000';
//export const API_URL = 'https://audite-backend-ggl32.ondigitalocean.app';
// Endpoints de la API
export const API = {
  auth: {
    login: `${API_URL}/auth/token`,
    register: `${API_URL}/auth/register`,
    me: `${API_URL}/auth/me`,
  },
  // Agregar otros endpoints según sea necesario
  agroData: {
    base: `${API_URL}/agro-data`,
    industryTypes: `${API_URL}/agro-data/industry-types`,
    equipment: `${API_URL}/agro-data/equipment`,
    processes: `${API_URL}/agro-data/processes`,
    equipmentCategories: `${API_URL}/agro-data/equipment-categories`,
    etapaSubsector: `${API_URL}/agro-data/etapa-subsector`,
    procesoProducto: `${API_URL}/agro-data/proceso-producto`,
    consumoPorFuente: `${API_URL}/agro-data/consumo-por-fuente`,
    equipo: `${API_URL}/agro-data/equipo`,
    auditoria: `${API_URL}/agro-data/auditoria`,
    loadDefaultData: `${API_URL}/agro-data/load-default-data`,
  },
  auditoria: {
    basica: `${API_URL}/auditoria-basica/`,
    agro: `${API_URL}/auditoria-agro/`,
  },
  admin: {
    benchmarks: `${API_URL}/admin/benchmarks`,
    parametros: `${API_URL}/admin/parametros`,
    exportarAuditorias: `${API_URL}/admin/exportar-auditorias`,
    exportarEstadisticas: `${API_URL}/admin/exportar-estadisticas`,
  },
  diagnosticosFeria: {
    base: `${API_URL}/api/diagnosticos-feria/`,
    iniciarContacto: `${API_URL}/api/diagnosticos-feria/iniciar-contacto/`,
    completar: `${API_URL}/api/diagnosticos-feria/`,
  },
  autodiagnostico: {
    preguntas: `${API_URL}/autodiagnostico/preguntas`,
    responder: `${API_URL}/autodiagnostico/responder`,
    sesion: (sessionId: string) => `${API_URL}/autodiagnostico/sesion/${sessionId}`,
    sugerencias: (sessionId: string) => `${API_URL}/autodiagnostico/sugerencias/${sessionId}`,
    sesionCompleta: (sessionId: string) => `${API_URL}/autodiagnostico/sesion/${sessionId}/completa`,
    admin: {
      preguntas: `${API_URL}/autodiagnostico/admin/preguntas`,
      pregunta: (id: number) => `${API_URL}/autodiagnostico/admin/preguntas/${id}`,
      estadisticas: `${API_URL}/autodiagnostico/admin/estadisticas`,
      respuestas: `${API_URL}/autodiagnostico/admin/respuestas`,
    },
  },
  // Nuevos endpoints para formularios por industria
  categoriasIndustria: {
    list: `${API_URL}/api/categorias-industria`,
    byId: (id: number) => `${API_URL}/api/categorias-industria/${id}`,
  },
  formulariosIndustria: {
    list: `${API_URL}/api/formularios`,
    byCategoria: (categoriaId: number) => `${API_URL}/api/formularios/${categoriaId}`,
    byId: (id: number) => `${API_URL}/api/formularios/${id}`,
  },
  diagnosticoIndustria: {
    categorias: `${API_URL}/api/categorias-industria`,
    formularios: (categoriaId: number) => `${API_URL}/api/formularios/${categoriaId}`,
    preguntas: (formularioId: number) => `${API_URL}/api/formulario/${formularioId}/preguntas`,
    responder: `${API_URL}/api/formulario/responder`,
    sugerencias: (sessionId: string) => `${API_URL}/api/formulario/sugerencias/${sessionId}`,
    sesion: (sessionId: string) => `${API_URL}/api/formulario/sesion/${sessionId}`,
    nuevaSesion: `${API_URL}/api/formulario/nueva-sesion`,
  },
  adminFormularios: {
    // Categorías Admin
    categorias: {
      list: `${API_URL}/api/admin/categorias-industria`,
      create: `${API_URL}/api/admin/categorias-industria`,
      update: (id: number) => `${API_URL}/api/admin/categorias-industria/${id}`,
      delete: (id: number) => `${API_URL}/api/admin/categorias-industria/${id}`,
    },
    // Formularios Admin
    formularios: {
      list: `${API_URL}/api/admin/formularios`,
      byCategoria: (categoriaId: number) => `${API_URL}/api/admin/formularios/${categoriaId}`,
      create: `${API_URL}/api/admin/formularios`,
      update: (id: number) => `${API_URL}/api/admin/formularios/${id}`,
      delete: (id: number) => `${API_URL}/api/admin/formularios/${id}`,
    },
    // Preguntas Admin
    preguntas: {
      byFormulario: (formularioId: number) => `${API_URL}/api/admin/preguntas/${formularioId}`,
      create: `${API_URL}/api/admin/preguntas`,
      update: (id: number) => `${API_URL}/api/admin/preguntas/${id}`,
      delete: (id: number) => `${API_URL}/api/admin/preguntas/${id}`,
      reordenar: (id: number) => `${API_URL}/api/admin/preguntas/${id}/orden`,
    },
    // Análisis Admin
    analisis: {
      estadisticas: (formularioId: number) => `${API_URL}/api/admin/estadisticas/${formularioId}`,
      respuestas: (formularioId: number) => `${API_URL}/api/admin/respuestas/${formularioId}`,
      condicionales: (formularioId: number) => `${API_URL}/api/admin/analisis-condicionales/${formularioId}`,
    },
  },
  openapi: `${API_URL}/openapi.json`,
}; 