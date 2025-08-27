/**
 * Hook para gestión de categorías de industria
 * Maneja listado, selección y estado de categorías
 */

import { useState, useEffect, useCallback } from 'react';
import { CategoriaIndustria, CategoriaIndustriaListResponse } from '@/types/industria';
import { API } from '@/config/api';

interface UseIndustryCategoriesReturn {
  categorias: CategoriaIndustria[];
  loading: boolean;
  error: string | null;
  selectedCategoria: CategoriaIndustria | null;
  selectCategoria: (categoria: CategoriaIndustria) => void;
  clearSelection: () => void;
  fetchCategorias: () => Promise<void>;
  getCategoriaById: (id: number) => CategoriaIndustria | undefined;
  categoriasActivas: CategoriaIndustria[];
}

export const useIndustryCategories = (): UseIndustryCategoriesReturn => {
  const [categorias, setCategorias] = useState<CategoriaIndustria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaIndustria | null>(null);

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API.categoriasIndustria.list, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: CategoriaIndustriaListResponse = await response.json();
      
      // Ordenar por campo orden
      const categoriasOrdenadas = data.categorias.sort((a, b) => a.orden - b.orden);
      setCategorias(categoriasOrdenadas);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar categorías';
      setError(errorMessage);
      console.error('Error fetchCategorias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCategoria = useCallback((categoria: CategoriaIndustria) => {
    setSelectedCategoria(categoria);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCategoria(null);
  }, []);

  const getCategoriaById = useCallback((id: number): CategoriaIndustria | undefined => {
    return categorias.find(categoria => categoria.id === id);
  }, [categorias]);

  // Computed value para categorías activas
  const categoriasActivas = categorias.filter(categoria => categoria.activa);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return {
    categorias,
    loading,
    error,
    selectedCategoria,
    selectCategoria,
    clearSelection,
    fetchCategorias,
    getCategoriaById,
    categoriasActivas
  };
}; 