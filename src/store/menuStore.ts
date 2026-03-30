import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { Category, Product } from '../types';

interface MenuStoreState {
  categories: Category[];
  products: Record<string, Product[]>; // keyed by category_id
  allProducts: Product[];
  isLoading: boolean;
  error: string | null;
  fetchMenu: () => Promise<void>;
}

export const useMenuStore = create<MenuStoreState>((set) => ({
  categories: [],
  products: {},
  allProducts: [],
  isLoading: false,
  error: null,

  fetchMenu: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id, name, color_hex, sort_order')
        .eq('is_active', true)
        .order('sort_order');

      if (catError) throw catError;

      const categories: Category[] = (catData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        colorHex: c.color_hex,
      }));

      // Fetch products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('id, category_id, name, price, has_modifiers, sort_order')
        .eq('type', 'dish')
        .eq('is_active', true)
        .order('sort_order');

      if (prodError) throw prodError;

      const allProducts: Product[] = (prodData || []).map((p: any) => ({
        id: p.id,
        categoryId: p.category_id,
        name: p.name,
        price: Number(p.price),
        hasModifiers: p.has_modifiers,
      }));

      // Group by category
      const products: Record<string, Product[]> = {};
      for (const cat of categories) {
        products[cat.id] = allProducts.filter(p => p.categoryId === cat.id);
      }

      set({ categories, products, allProducts, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch menu:', err.message);
      set({ error: err.message, isLoading: false });
    }
  },
}));
