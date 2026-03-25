import { create } from 'zustand';
import { Product, OrderItem, Guest, Modifier, ActiveAction } from '../types';

interface OrderState {
  items: OrderItem[];
  guests: Guest[];
  selectedItemId: string | null;
  activeAction: ActiveAction;
  activeCategoryId: string; // Tracks the currently selected menu category
  
  addGuest: () => void;
  addProduct: (product: Product) => void;
  removeProduct: (itemId: string) => void;
  clearOrder: () => void;
  getTotal: () => number;
  
  selectItem: (itemId: string | null) => void;
  setActiveAction: (action: ActiveAction) => void;
  setActiveCategory: (categoryId: string) => void;
  toggleModifier: (modifier: Modifier) => void;
  updateQuantity: (itemId: string, delta: number) => void;
}

// Helper to generate a short random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock initial data to match the order_creation.png design
const mockGuests: Guest[] = [
  { id: 'guest_1', name: 'Гость 1' },
  { id: 'guest_2', name: 'Гость 2' },
];

const mockItems: OrderItem[] = [
  {
    id: 'item_1',
    product: { id: 'p1', categoryId: 'hot', name: 'Биг Тейсти', price: 210 },
    quantity: 1,
    guestId: 'guest_1',
    modifiers: [],
  },
  {
    id: 'item_2',
    product: { id: 'p2', categoryId: 'hot', name: 'Салат оливье', price: 320 },
    quantity: 1,
    guestId: 'guest_1',
    modifiers: [],
  },
  {
    id: 'item_3',
    product: { id: 'p3', categoryId: 'hot', name: 'Пицца «Гурман»', price: 240 },
    quantity: 1,
    guestId: 'guest_2',
    modifiers: [
      { id: 'm2', name: 'Помидоры', price: 30 },
      { id: 'm1', name: 'Лук', price: 0 },
    ],
  }
];

export const useOrderStore = create<OrderState>((set, get) => ({
  items: mockItems,
  guests: mockGuests,
  selectedItemId: 'item_3', 
  activeAction: 'modifiers',
  activeCategoryId: 'hot',

  addGuest: () => {
    set((state) => {
      const newGuestNumber = state.guests.length + 1;
      return {
        guests: [...state.guests, { id: `guest_${newGuestNumber}`, name: `Гость ${newGuestNumber}` }]
      };
    });
  },

  addProduct: (product: Product) => {
    set((state) => {
      const existingUnmodifiedItem = state.items.find(
        (item) => item.product.id === product.id && item.modifiers.length === 0 && item.guestId === null
      );

      if (existingUnmodifiedItem) {
        return {
          items: state.items.map((item) =>
            item.id === existingUnmodifiedItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          selectedItemId: existingUnmodifiedItem.id,
          activeAction: 'modifiers',
        };
      }

      const newItem: OrderItem = {
        id: generateId(),
        product,
        quantity: 1,
        guestId: null, // Default to general order
        modifiers: [],
      };

      return { 
        items: [...state.items, newItem],
        selectedItemId: newItem.id, // Automatically select the new item for modification
        activeAction: 'modifiers',
      };
    });
  },

  removeProduct: (itemId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
      selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId,
    }));
  },

  updateQuantity: (itemId: string, delta: number) => {
    set((state) => {
      const items = state.items.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0); 
      
      const itemStillExists = items.some(i => i.id === state.selectedItemId);
      
      return { 
        items,
        selectedItemId: itemStillExists ? state.selectedItemId : null
      };
    });
  },

  clearOrder: () => set({ items: [], guests: [], selectedItemId: null }),

  getTotal: () => {
    return get().items.reduce((sum, item) => {
      const itemModifiersPrice = item.modifiers.reduce((modSum, mod) => modSum + mod.price, 0);
      return sum + ((item.product.price + itemModifiersPrice) * item.quantity);
    }, 0);
  },

  selectItem: (itemId: string | null) => set({ selectedItemId: itemId }),

  setActiveAction: (action: ActiveAction) => set({ activeAction: action }),
  
  setActiveCategory: (categoryId: string) => set({ activeCategoryId: categoryId }),

  setQuantity: (itemId: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },

  toggleModifier: (modifier: Modifier) => {
    set((state) => {
      if (!state.selectedItemId) return state;

      return {
        items: state.items.map((item) => {
          if (item.id !== state.selectedItemId) return item;

          const hasModifier = item.modifiers.some((m) => m.id === modifier.id);
          const newModifiers = hasModifier
            ? item.modifiers.filter((m) => m.id !== modifier.id) // Remove it
            : [...item.modifiers, modifier]; // Add it

          return { ...item, modifiers: newModifiers };
        }),
      };
    });
  },
}));

