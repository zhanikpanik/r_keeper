import { create } from 'zustand';
import { Product, OrderItem, Guest, Modifier, ActiveAction, Order } from '../types';
import { supabase } from '../utils/supabase';
import { useShiftStore } from './shiftStore';

const VENUE_ID = '00000000-0000-0000-0000-000000000010';

// Helper to generate a UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Format current time as HH:MM
const now = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// ── Helper: calculate total from items ──
const calcTotal = (items: OrderItem[]): number =>
  items.reduce((sum, item) => {
    const modPrice = item.modifiers.reduce((ms, m) => ms + m.price, 0);
    return sum + (item.product.price + modPrice) * item.quantity;
  }, 0);

// Get next order number (resets daily)
const getNextOrderNumber = (orders: Order[]): string => {
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => {
    // Compare by openedAt time string — rough but works for same-day
    return true; // For MVP, just increment globally
  });
  const nums = orders.map(o => parseFloat(o.number)).filter(n => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  return String(Math.floor(maxNum) + 1);
};

// ═══ Supabase sync functions (fire-and-forget) ═══

const syncCreateOrder = async (order: Order) => {
  try {
    const { error } = await supabase.from('orders').insert({
      id: order.id,
      venue_id: VENUE_ID,
      table_id: order.tableId || null,
      number: order.number,
      status: order.status,
      guest_count: order.guestCount,
      table_number: order.tableNumber || null,
      zone_name: order.zone,
      order_type: order.type,
      is_quick_check: order.isQuickCheck || false,
      opened_at: new Date().toISOString(),
      total_amount: order.totalAmount,
      waiter_id: null, // TODO: map waiter name to ID
    });
    if (error) console.error('syncCreateOrder:', error.message);
  } catch (e: any) {
    console.error('syncCreateOrder:', e.message);
  }
};

const syncUpdateOrder = async (order: Order) => {
  try {
    const { error } = await supabase.from('orders').update({
      status: order.status,
      guest_count: order.guestCount,
      table_id: order.tableId || null,
      table_number: order.tableNumber || null,
      zone_name: order.zone,
      total_amount: order.totalAmount,
      comment: (order as any).comment || null,
    }).eq('id', order.id);
    if (error) console.error('syncUpdateOrder:', error.message);
  } catch (e: any) {
    console.error('syncUpdateOrder:', e.message);
  }
};

const syncOrderItems = async (orderId: string, items: OrderItem[]) => {
  try {
    // Delete existing items
    await supabase.from('order_item_modifiers')
      .delete()
      .in('order_item_id', items.map(i => i.id).concat(['__none__']));

    await supabase.from('order_items').delete().eq('order_id', orderId);

    // Insert current items
    if (items.length > 0) {
      const orderItems = items.map(item => ({
        id: item.id,
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        guest_number: item.guestId ? parseInt(item.guestId.replace(/\D/g, '')) || 1 : 1,
      }));

      const { error } = await supabase.from('order_items').insert(orderItems);
      if (error) console.error('syncOrderItems insert:', error.message);

      // Insert modifiers
      const modRows: any[] = [];
      items.forEach(item => {
        item.modifiers.forEach(mod => {
          modRows.push({
            order_item_id: item.id,
            modifier_id: mod.id,
            modifier_name: mod.name,
            modifier_price: mod.price,
          });
        });
      });
      if (modRows.length > 0) {
        await supabase.from('order_item_modifiers').insert(modRows);
      }
    }
  } catch (e: any) {
    console.error('syncOrderItems:', e.message);
  }
};

const syncDeleteOrder = async (orderId: string) => {
  try {
    await supabase.from('order_item_modifiers')
      .delete()
      .in('order_item_id',
        (await supabase.from('order_items').select('id').eq('order_id', orderId)).data?.map((i: any) => i.id) || []
      );
    await supabase.from('order_items').delete().eq('order_id', orderId);
    await supabase.from('orders').delete().eq('id', orderId);
  } catch (e: any) {
    console.error('syncDeleteOrder:', e.message);
  }
};

// ═══ Load orders from Supabase ═══

const loadOrdersFromSupabase = async (): Promise<Order[]> => {
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('venue_id', VENUE_ID)
      .in('status', ['active', 'alert'])
      .order('opened_at');

    if (orderError) throw orderError;
    if (!orderData || orderData.length === 0) return [];

    // Load items for all orders
    const orderIds = orderData.map((o: any) => o.id);
    const { data: itemData } = await supabase
      .from('order_items')
      .select('*, order_item_modifiers(*)')
      .in('order_id', orderIds);

    return orderData.map((o: any) => {
      const items: OrderItem[] = (itemData || [])
        .filter((i: any) => i.order_id === o.id)
        .map((i: any) => ({
          id: i.id,
          product: {
            id: i.product_id,
            categoryId: '',
            name: i.product_name,
            price: Number(i.product_price),
          },
          quantity: i.quantity,
          guestId: null,
          modifiers: (i.order_item_modifiers || []).map((m: any) => ({
            id: m.modifier_id || m.id,
            name: m.modifier_name,
            price: Number(m.modifier_price),
          })),
        }));

      return {
        id: o.id,
        number: o.number,
        status: o.status as any,
        waiter: 'Иванов', // TODO: resolve from waiter_id
        openedAt: new Date(o.opened_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        zone: o.zone_name || '',
        type: o.order_type || 'Общий',
        totalAmount: Number(o.total_amount),
        tableNumber: o.table_number || '',
        tableId: o.table_id || '',
        guestCount: o.guest_count || 1,
        guests: Array.from({ length: o.guest_count || 1 }, (_, i) => ({
          id: `g${i + 1}`,
          name: `Гость ${i + 1}`,
        })),
        items,
        isQuickCheck: o.is_quick_check || false,
        comment: o.comment,
      } as Order;
    });
  } catch (e: any) {
    console.error('loadOrdersFromSupabase:', e.message);
    return [];
  }
};

// ═══ Sync helper: debounced item sync ═══
let itemSyncTimeout: any = null;
const debouncedSyncItems = (orderId: string, items: OrderItem[]) => {
  if (itemSyncTimeout) clearTimeout(itemSyncTimeout);
  itemSyncTimeout = setTimeout(() => {
    syncOrderItems(orderId, items);
    // Also update the order total
    const total = calcTotal(items);
    supabase.from('orders').update({ total_amount: total }).eq('id', orderId);
  }, 500); // Wait 500ms after last change
};

// ═══ Store ═══

// ── Sync current editing state back into the orders array ──
const syncToOrders = (state: OrderStoreState): Order[] => {
  if (!state.currentOrderId) return state.orders;

  const total = calcTotal(state.items);
  const updated = state.orders.map(o =>
    o.id === state.currentOrderId
      ? {
          ...o,
          items: state.items,
          guests: state.guests,
          totalAmount: total,
          guestCount: state.guests.length,
          tableNumber: state.tableNumber,
          tableId: state.tableId,
          isQuickCheck: state.isQuickCheck,
          status: total > 0 ? 'active' as const : o.status,
        }
      : o
  );

  // Debounced sync to Supabase
  debouncedSyncItems(state.currentOrderId, state.items);

  return updated;
};

interface OrderStoreState {
  orders: Order[];
  currentOrderId: string | null;
  items: OrderItem[];
  guests: Guest[];
  tableNumber: string;
  tableId: string;
  isQuickCheck: boolean;
  selectedItemId: string | null;
  activeGuestId: string | null;
  activeAction: ActiveAction;
  activeCategoryId: string;
  activeModifierGroupId: string;

  // Actions
  fetchOrders: () => Promise<void>;
  createOrderForTable: (tableId: string, tableNumber: string, zone: string) => string;
  createQuickCheck: () => string;
  getOrderForTable: (tableId: string) => Order | undefined;
  openOrder: (orderId: string) => void;
  closeOrder: () => void;
  deleteOrder: (orderId: string) => void;
  addGuest: () => void;
  setActiveGuest: (guestId: string | null) => void;
  addProduct: (product: Product) => void;
  removeProduct: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  getTotal: () => number;
  getGuestTotal: (guestId: string | null) => number;
  selectItem: (itemId: string | null) => void;
  setActiveAction: (action: ActiveAction) => void;
  setActiveCategory: (categoryId: string) => void;
  setActiveModifierGroup: (groupId: string) => void;
  toggleModifier: (modifier: Modifier) => void;
  assignItemToGuest: (itemId: string, guestId: string | null) => void;
}

export const useOrderStore = create<OrderStoreState>((set, get) => ({
  orders: [],
  currentOrderId: null,
  items: [],
  guests: [],
  tableNumber: '',
  tableId: '',
  isQuickCheck: false,
  selectedItemId: null,
  activeGuestId: null,
  activeAction: null,
  activeCategoryId: '',
  activeModifierGroupId: 'filling',

  // ── Load from Supabase ──
  fetchOrders: async () => {
    const orders = await loadOrdersFromSupabase();
    set({ orders });
  },

  // ── Create order for table ──
  createOrderForTable: (tableId: string, tableNumber: string, zone: string) => {
    const state = get();
    const existing = state.orders.find(o => o.tableId === tableId && o.status !== 'inactive');
    if (existing) {
      get().openOrder(existing.id);
      return existing.id;
    }

    const id = generateId();
    const guest1Id = generateId();
    const guests = [{ id: guest1Id, name: 'Гость 1' }];
    const currentUser = useShiftStore.getState().currentUser;

    const newOrder: Order = {
      id,
      number: getNextOrderNumber(state.orders),
      status: 'active',
      waiter: currentUser?.name || 'Иванов',
      openedAt: now(),
      zone,
      type: 'Общий',
      totalAmount: 0,
      tableNumber,
      tableId,
      guestCount: 1,
      guests: [...guests],
      items: [],
    };

    set({
      orders: [...state.orders, newOrder],
      currentOrderId: id,
      items: [],
      guests,
      tableNumber,
      tableId,
      isQuickCheck: false,
      selectedItemId: null,
      activeGuestId: guest1Id,
      activeAction: null,
    });

    // Sync to Supabase
    syncCreateOrder(newOrder);

    return id;
  },

  // ── Quick check ──
  createQuickCheck: () => {
    const state = get();
    const id = generateId();
    const guest1Id = generateId();
    const guests = [{ id: guest1Id, name: 'Гость 1' }];
    const currentUser = useShiftStore.getState().currentUser;

    const newOrder: Order = {
      id,
      number: getNextOrderNumber(state.orders),
      status: 'active',
      waiter: currentUser?.name || 'Иванов',
      openedAt: now(),
      zone: 'Быстрый чек',
      type: 'Общий',
      totalAmount: 0,
      tableNumber: '',
      tableId: '',
      guestCount: 1,
      guests: [...guests],
      items: [],
      isQuickCheck: true,
    };

    set({
      orders: [...state.orders, newOrder],
      currentOrderId: id,
      items: [],
      guests,
      tableNumber: '',
      tableId: '',
      isQuickCheck: true,
      selectedItemId: null,
      activeGuestId: guest1Id,
      activeAction: null,
    });

    syncCreateOrder(newOrder);
    return id;
  },

  getOrderForTable: (tableId: string) => {
    return get().orders.find(o => o.tableId === tableId && o.status !== 'inactive');
  },

  openOrder: (orderId: string) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    set({
      currentOrderId: order.id,
      items: JSON.parse(JSON.stringify(order.items)),
      guests: JSON.parse(JSON.stringify(order.guests)),
      tableNumber: order.tableNumber,
      tableId: order.tableId || '',
      isQuickCheck: order.isQuickCheck || false,
      selectedItemId: null,
      activeGuestId: order.guests.length > 0 ? order.guests[0].id : null,
      activeAction: null,
    });
  },

  closeOrder: () => {
    const state = get();
    // Sync final state to Supabase before closing
    if (state.currentOrderId) {
      const order = state.orders.find(o => o.id === state.currentOrderId);
      if (order) syncUpdateOrder(order);
    }

    set({
      currentOrderId: null,
      items: [],
      guests: [],
      selectedItemId: null,
      tableId: '',
      tableNumber: '',
      isQuickCheck: false,
    });
  },

  deleteOrder: (orderId: string) => {
    set((state) => ({
      orders: state.orders.filter(o => o.id !== orderId),
    }));
    syncDeleteOrder(orderId);
  },

  // ── POS editing (all auto-save via syncToOrders) ──

  addGuest: () => {
    set((state) => {
      const newGuestNumber = state.guests.length + 1;
      const newGuest = { id: generateId(), name: `Гость ${newGuestNumber}` };
      const newState = { ...state, guests: [...state.guests, newGuest] };
      return { guests: newState.guests, orders: syncToOrders(newState) };
    });
  },

  setActiveGuest: (guestId: string | null) => {
    set({ activeGuestId: guestId });
  },

  addProduct: (product: Product) => {
    set((state) => {
      const targetGuestId = state.activeGuestId;
      const existing = state.items.find(
        (item) => item.product.id === product.id
          && item.modifiers.length === 0
          && item.guestId === targetGuestId
      );

      if (existing) {
        const newItems = state.items.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        const newState = { ...state, items: newItems };
        return { items: newItems, orders: syncToOrders(newState) };
      }

      const newItem: OrderItem = {
        id: generateId(),
        product,
        quantity: 1,
        guestId: targetGuestId,
        modifiers: [],
      };
      const newItems = [...state.items, newItem];
      const newState = { ...state, items: newItems };

      if (product.hasModifiers) {
        return {
          items: newItems,
          selectedItemId: newItem.id,
          activeAction: 'modifiers' as ActiveAction,
          orders: syncToOrders(newState),
        };
      }

      return { items: newItems, orders: syncToOrders(newState) };
    });
  },

  removeProduct: (itemId: string) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== itemId);
      const newState = { ...state, items: newItems };
      return {
        items: newItems,
        selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId,
        activeAction: state.selectedItemId === itemId ? null : state.activeAction,
        orders: syncToOrders(newState),
      };
    });
  },

  updateQuantity: (itemId: string, delta: number) => {
    set((state) => {
      const newItems = state.items.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0);

      const itemStillExists = newItems.some(i => i.id === state.selectedItemId);
      const newState = { ...state, items: newItems };
      return {
        items: newItems,
        selectedItemId: itemStillExists ? state.selectedItemId : null,
        activeAction: itemStillExists ? state.activeAction : null,
        orders: syncToOrders(newState),
      };
    });
  },

  getTotal: () => calcTotal(get().items),
  getGuestTotal: (guestId: string | null) => calcTotal(get().items.filter(item => item.guestId === guestId)),

  selectItem: (itemId: string | null) => {
    if (!itemId) {
      set({ selectedItemId: null, activeAction: null });
      return;
    }
    const item = get().items.find(i => i.id === itemId);
    const hasModifiers = item?.product.hasModifiers || item?.modifiers.length;
    set({
      selectedItemId: itemId,
      activeAction: hasModifiers ? 'modifiers' : 'quantity',
    });
  },

  setActiveAction: (action: ActiveAction) => set({ activeAction: action }),
  setActiveCategory: (categoryId: string) => set({ activeCategoryId: categoryId }),
  setActiveModifierGroup: (groupId: string) => set({ activeModifierGroupId: groupId }),

  toggleModifier: (modifier: Modifier) => {
    set((state) => {
      if (!state.selectedItemId) return state;
      const newItems = state.items.map((item) => {
        if (item.id !== state.selectedItemId) return item;
        const has = item.modifiers.some((m) => m.id === modifier.id);
        const newMods = has
          ? item.modifiers.filter((m) => m.id !== modifier.id)
          : [...item.modifiers, modifier];
        return { ...item, modifiers: newMods };
      });
      const newState = { ...state, items: newItems };
      return { items: newItems, orders: syncToOrders(newState) };
    });
  },

  assignItemToGuest: (itemId: string, guestId: string | null) => {
    set((state) => {
      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, guestId } : item
      );
      const newState = { ...state, items: newItems };
      return { items: newItems, orders: syncToOrders(newState) };
    });
  },
}));
