import { create } from 'zustand';
import { Product, OrderItem, Guest, Modifier, ActiveAction, Order } from '../types';

// Helper to generate a short random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Format current time as HH:MM
const now = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// ── Seed data: pre-existing orders linked to floor plan tables ──
const seedOrders: Order[] = [
  {
    id: 'o1', number: '1', status: 'active', waiter: 'Иванов', openedAt: '16:30',
    zone: 'Основной зал', type: 'Общий', totalAmount: 1090, tableNumber: '1', tableId: 't1', guestCount: 2,
    guests: [{ id: 'g1', name: 'Гость 1' }, { id: 'g2', name: 'Гость 2' }],
    items: [
      { id: 'i1', product: { id: 'h1', categoryId: 'hot', name: 'Выгодная пара с барбекю', price: 230 }, quantity: 2, guestId: 'g1', modifiers: [] },
      { id: 'i2', product: { id: 'h3', categoryId: 'hot', name: 'Три сыра', price: 250 }, quantity: 1, guestId: 'g1', modifiers: [] },
      { id: 'i3', product: { id: 'b1', categoryId: 'bar', name: 'Кока-кола', price: 90 }, quantity: 2, guestId: 'g2', modifiers: [] },
    ],
  },
  {
    id: 'o2', number: '2', status: 'active', waiter: 'Иванов', openedAt: '16:45',
    zone: 'Основной зал', type: 'Общий', totalAmount: 1200, tableNumber: '5', tableId: 't5', guestCount: 1,
    guests: [{ id: 'g1', name: 'Гость 1' }],
    items: [
      { id: 'i5', product: { id: 'pz2', categoryId: 'pizza', name: 'Пепперони', price: 400 }, quantity: 3, guestId: 'g1', modifiers: [] },
    ],
  },
  {
    id: 'o3', number: '3', status: 'active', waiter: 'Иванов', openedAt: '17:10',
    zone: 'Основной зал', type: 'Общий', totalAmount: 1060, tableNumber: '4', tableId: 't4', guestCount: 2,
    guests: [{ id: 'g1', name: 'Гость 1' }, { id: 'g2', name: 'Гость 2' }],
    items: [
      { id: 'i10', product: { id: 'h11', categoryId: 'hot', name: 'Биг Мак', price: 330 }, quantity: 1, guestId: 'g1', modifiers: [] },
      { id: 'i11', product: { id: 'sa1', categoryId: 'salads', name: 'Цезарь', price: 280 }, quantity: 1, guestId: 'g1', modifiers: [] },
      { id: 'i12', product: { id: 'pz3', categoryId: 'pizza', name: '4 сыра', price: 420 }, quantity: 1, guestId: 'g2', modifiers: [{ id: 'm1', name: 'Лук', price: 0 }, { id: 'm2', name: 'Помидор', price: 30 }] },
    ],
    hasNote: true,
  },
  {
    id: 'o4', number: '4', status: 'alert', waiter: 'Петров', openedAt: '15:20',
    zone: 'Основной зал', type: 'Общий', totalAmount: 890, tableNumber: '8', tableId: 't8', guestCount: 1,
    guests: [{ id: 'g1', name: 'Гость 1' }],
    items: [
      { id: 'i20', product: { id: 'sp2', categoryId: 'soups', name: 'Том Ям', price: 350 }, quantity: 1, guestId: 'g1', modifiers: [] },
      { id: 'i21', product: { id: 'h4', categoryId: 'hot', name: 'Карбонара', price: 260 }, quantity: 1, guestId: 'g1', modifiers: [] },
      { id: 'i22', product: { id: 'sa2', categoryId: 'salads', name: 'Греческий', price: 250 }, quantity: 1, guestId: 'g1', modifiers: [{ id: 'ms4', name: 'Барбекю', price: 20 }] },
    ],
    hasAlert: true, hasNote: true,
  },
  {
    id: 'o5', number: '5', status: 'active', waiter: 'Иванов', openedAt: '17:30',
    zone: 'Веранда', type: 'Общий', totalAmount: 700, tableNumber: '21', tableId: 'v1', guestCount: 2,
    guests: [{ id: 'g1', name: 'Гость 1' }, { id: 'g2', name: 'Гость 2' }],
    items: [
      { id: 'i30', product: { id: 'pz1', categoryId: 'pizza', name: 'Маргарита', price: 350 }, quantity: 2, guestId: 'g1', modifiers: [] },
    ],
  },
  {
    id: 'o6', number: '6', status: 'active', waiter: 'Петров', openedAt: '18:00',
    zone: 'Веранда', type: 'Общий', totalAmount: 480, tableNumber: '25', tableId: 'v5', guestCount: 1,
    guests: [{ id: 'g1', name: 'Гость 1' }],
    items: [
      { id: 'i40', product: { id: 'v1', categoryId: 'vegan', name: 'Фалафель', price: 220 }, quantity: 1, guestId: 'g1', modifiers: [] },
      { id: 'i41', product: { id: 'h4', categoryId: 'hot', name: 'Карбонара', price: 260 }, quantity: 1, guestId: 'g1', modifiers: [] },
    ],
  },
];

interface OrderStoreState {
  // ── All orders ──
  orders: Order[];

  // ── Currently editing order (POS screen) ──
  currentOrderId: string | null;
  items: OrderItem[];
  guests: Guest[];
  tableNumber: string;
  tableId: string;
  isQuickCheck: boolean;
  selectedItemId: string | null;
  activeGuestId: string | null; // which guest new items get assigned to
  activeAction: ActiveAction;
  activeCategoryId: string;
  activeModifierGroupId: string;

  // ── Order list actions ──
  createNewOrder: () => string; // returns order ID (legacy, use createOrderForTable)
  createOrderForTable: (tableId: string, tableNumber: string, zone: string) => string;
  createQuickCheck: () => string;
  getOrderForTable: (tableId: string) => Order | undefined;
  openOrder: (orderId: string) => void;
  saveCurrentOrder: () => void;
  deleteOrder: (orderId: string) => void;

  // ── POS editing actions ──
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

// Get next order number
const getNextOrderNumber = (orders: Order[]): string => {
  const nums = orders.map(o => parseFloat(o.number)).filter(n => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  return String(Math.floor(maxNum) + 1);
};

export const useOrderStore = create<OrderStoreState>((set, get) => ({
  orders: seedOrders,

  currentOrderId: null,
  items: [],
  guests: [],
  tableNumber: '',
  tableId: '',
  isQuickCheck: false,
  selectedItemId: null,
  activeGuestId: null,
  activeAction: null,
  activeCategoryId: 'hot',
  activeModifierGroupId: 'filling',

  // ── Order list ──

  createNewOrder: () => {
    // Legacy — prefer createOrderForTable or createQuickCheck
    const state = get();
    const id = generateId();
    const guest1Id = generateId();
    set({
      currentOrderId: id,
      items: [],
      guests: [{ id: guest1Id, name: 'Гость 1' }],
      tableNumber: '',
      tableId: '',
      isQuickCheck: false,
      selectedItemId: null,
      activeGuestId: guest1Id,
      activeAction: null,
      activeCategoryId: 'hot',
      activeModifierGroupId: 'filling',
    });
    return id;
  },

  createOrderForTable: (tableId: string, tableNumber: string, zone: string) => {
    // Check if table already has an active order
    const existing = get().orders.find(o => o.tableId === tableId && o.status !== 'inactive');
    if (existing) {
      // Open existing order instead
      get().openOrder(existing.id);
      return existing.id;
    }

    const id = generateId();
    const guest1Id = generateId();
    set({
      currentOrderId: id,
      items: [],
      guests: [{ id: guest1Id, name: 'Гость 1' }],
      tableNumber,
      tableId,
      isQuickCheck: false,
      selectedItemId: null,
      activeGuestId: guest1Id,
      activeAction: null,
      activeCategoryId: 'hot',
      activeModifierGroupId: 'filling',
    });
    return id;
  },

  createQuickCheck: () => {
    const id = generateId();
    const guest1Id = generateId();
    set({
      currentOrderId: id,
      items: [],
      guests: [{ id: guest1Id, name: 'Гость 1' }],
      tableNumber: '',
      tableId: '',
      isQuickCheck: true,
      selectedItemId: null,
      activeGuestId: guest1Id,
      activeAction: null,
      activeCategoryId: 'hot',
      activeModifierGroupId: 'filling',
    });
    return id;
  },

  getOrderForTable: (tableId: string) => {
    return get().orders.find(o => o.tableId === tableId && o.status !== 'inactive');
  },

  openOrder: (orderId: string) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    const guestsCopy: Guest[] = JSON.parse(JSON.stringify(order.guests));

    set({
      currentOrderId: order.id,
      items: JSON.parse(JSON.stringify(order.items)),
      guests: guestsCopy,
      tableNumber: order.tableNumber,
      tableId: order.tableId || '',
      isQuickCheck: order.isQuickCheck || false,
      selectedItemId: null,
      activeGuestId: guestsCopy.length > 0 ? guestsCopy[0].id : null,
      activeAction: null,
      activeCategoryId: 'hot',
      activeModifierGroupId: 'filling',
    });
  },

  saveCurrentOrder: () => {
    const state = get();
    if (!state.currentOrderId) return;

    const total = state.getTotal();
    const existingIdx = state.orders.findIndex(o => o.id === state.currentOrderId);

    const resetState = { currentOrderId: null, items: [] as OrderItem[], guests: [] as Guest[], selectedItemId: null, tableId: '', tableNumber: '', isQuickCheck: false };

    if (existingIdx >= 0) {
      const updated = [...state.orders];
      updated[existingIdx] = {
        ...updated[existingIdx],
        items: JSON.parse(JSON.stringify(state.items)),
        guests: JSON.parse(JSON.stringify(state.guests)),
        totalAmount: total,
        guestCount: state.guests.length,
        tableNumber: state.tableNumber,
        tableId: state.tableId,
        isQuickCheck: state.isQuickCheck,
        status: total > 0 ? 'active' : updated[existingIdx].status,
        hasEdit: true,
      };
      set({ orders: updated, ...resetState });
    } else {
      const newOrder: Order = {
        id: state.currentOrderId,
        number: getNextOrderNumber(state.orders),
        status: 'active',
        waiter: 'Иванов',
        openedAt: now(),
        zone: state.isQuickCheck ? 'Быстрый чек' : 'Основной зал',
        type: 'Общий',
        totalAmount: total,
        tableNumber: state.tableNumber,
        tableId: state.tableId,
        guestCount: state.guests.length,
        guests: JSON.parse(JSON.stringify(state.guests)),
        items: JSON.parse(JSON.stringify(state.items)),
        isQuickCheck: state.isQuickCheck,
      };
      set({ orders: [...state.orders, newOrder], ...resetState });
    }
  },

  deleteOrder: (orderId: string) => {
    set((state) => ({
      orders: state.orders.filter(o => o.id !== orderId),
    }));
  },

  // ── POS editing ──

  addGuest: () => {
    set((state) => {
      const newGuestNumber = state.guests.length + 1;
      const newGuest = { id: generateId(), name: `Гость ${newGuestNumber}` };
      return { guests: [...state.guests, newGuest] };
    });
  },

  setActiveGuest: (guestId: string | null) => {
    set({ activeGuestId: guestId });
  },

  addProduct: (product: Product) => {
    set((state) => {
      const targetGuestId = state.activeGuestId;

      // Check for existing unmodified item for same product + same guest
      const existing = state.items.find(
        (item) => item.product.id === product.id
          && item.modifiers.length === 0
          && item.guestId === targetGuestId
      );

      if (existing) {
        // Just increment quantity — don't switch to modifier mode
        return {
          items: state.items.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          // Only enter modifier mode if product has modifiers AND wasn't already in the list
          // For repeat taps, stay in browse mode
        };
      }

      const newItem: OrderItem = {
        id: generateId(),
        product,
        quantity: 1,
        guestId: targetGuestId,
        modifiers: [],
      };

      // Product with modifiers → enter modifier mode
      // Product without → stay in browse mode
      if (product.hasModifiers) {
        return {
          items: [...state.items, newItem],
          selectedItemId: newItem.id,
          activeAction: 'modifiers' as ActiveAction,
        };
      }

      return {
        items: [...state.items, newItem],
        // Stay in browse mode — don't select, don't change action
      };
    });
  },

  removeProduct: (itemId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
      selectedItemId: state.selectedItemId === itemId ? null : state.selectedItemId,
      activeAction: state.selectedItemId === itemId ? null : state.activeAction,
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
        selectedItemId: itemStillExists ? state.selectedItemId : null,
        activeAction: itemStillExists ? state.activeAction : null,
      };
    });
  },

  getTotal: () => {
    return get().items.reduce((sum, item) => {
      const modPrice = item.modifiers.reduce((ms, m) => ms + m.price, 0);
      return sum + (item.product.price + modPrice) * item.quantity;
    }, 0);
  },

  getGuestTotal: (guestId: string | null) => {
    return get().items
      .filter(item => item.guestId === guestId)
      .reduce((sum, item) => {
        const modPrice = item.modifiers.reduce((ms, m) => ms + m.price, 0);
        return sum + (item.product.price + modPrice) * item.quantity;
      }, 0);
  },

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
      return {
        items: state.items.map((item) => {
          if (item.id !== state.selectedItemId) return item;
          const has = item.modifiers.some((m) => m.id === modifier.id);
          const newMods = has
            ? item.modifiers.filter((m) => m.id !== modifier.id)
            : [...item.modifiers, modifier];
          return { ...item, modifiers: newMods };
        }),
      };
    });
  },

  assignItemToGuest: (itemId: string, guestId: string | null) => {
    set((state) => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, guestId } : item
      ),
    }));
  },
}));
