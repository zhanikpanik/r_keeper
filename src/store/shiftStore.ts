import { create } from 'zustand';
import { Shift } from '../types';
import { supabase } from '../utils/supabase';

const VENUE_ID = '00000000-0000-0000-0000-000000000010';

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface CurrentUser {
  id: string;
  name: string;
  role: string;
}

interface ShiftStoreState {
  currentUser: CurrentUser | null;
  currentShift: Shift | null;
  shiftHistory: Shift[];

  setCurrentUser: (user: CurrentUser) => void;
  logout: () => void;
  openShift: (startingCash: number) => void;
  closeShift: () => Shift | null;
  recordPayment: (method: 'cash' | 'card' | 'other', amount: number) => void;
  isShiftOpen: () => boolean;
  fetchOpenShift: () => Promise<boolean>;
}

export const useShiftStore = create<ShiftStoreState>((set, get) => ({
  currentUser: null,
  currentShift: null,
  shiftHistory: [],

  setCurrentUser: (user: CurrentUser) => set({ currentUser: user }),

  logout: () => set({ currentUser: null, currentShift: null }),

  openShift: (startingCash: number) => {
    const { currentUser } = get();
    const shift: Shift = {
      id: generateId(),
      cashier: currentUser?.name || 'Неизвестный',
      openedAt: new Date(),
      startingCash,
      totalOrders: 0,
      totalRevenue: 0,
      cashPayments: 0,
      cashTotal: 0,
      cardPayments: 0,
      cardTotal: 0,
      otherPayments: 0,
      otherTotal: 0,
    };
    set({ currentShift: shift });

    // Sync to Supabase
    supabase.from('shifts').insert({
      id: shift.id,
      venue_id: VENUE_ID,
      cashier_id: currentUser?.id || null,
      opened_at: shift.openedAt.toISOString(),
      starting_cash: startingCash,
    }).then(({ error }) => {
      if (error) console.error('openShift sync:', error.message);
    });
  },

  closeShift: () => {
    const { currentShift } = get();
    if (!currentShift) return null;

    const closedShift: Shift = {
      ...currentShift,
      closedAt: new Date(),
    };

    set((state) => ({
      currentShift: null,
      shiftHistory: [...state.shiftHistory, closedShift],
    }));

    // Sync to Supabase
    supabase.from('shifts').update({
      closed_at: closedShift.closedAt!.toISOString(),
      total_orders: closedShift.totalOrders,
      total_revenue: closedShift.totalRevenue,
      cash_total: closedShift.cashTotal,
      card_total: closedShift.cardTotal,
      other_total: closedShift.otherTotal,
    }).eq('id', closedShift.id).then(({ error }) => {
      if (error) console.error('closeShift sync:', error.message);
    });

    return closedShift;
  },

  recordPayment: (method: 'cash' | 'card' | 'other', amount: number) => {
    set((state) => {
      if (!state.currentShift) return state;

      const shift = { ...state.currentShift };
      shift.totalOrders += 1;
      shift.totalRevenue += amount;

      if (method === 'cash') {
        shift.cashPayments += 1;
        shift.cashTotal += amount;
      } else if (method === 'card') {
        shift.cardPayments += 1;
        shift.cardTotal += amount;
      } else {
        shift.otherPayments += 1;
        shift.otherTotal += amount;
      }

      return { currentShift: shift };
    });
  },

  isShiftOpen: () => get().currentShift !== null,

  fetchOpenShift: async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('venue_id', VENUE_ID)
        .is('closed_at', null)
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return false;

      const shift: Shift = {
        id: data.id,
        cashier: 'Кассир', // Will be resolved after PIN
        openedAt: new Date(data.opened_at),
        startingCash: Number(data.starting_cash),
        totalOrders: data.total_orders || 0,
        totalRevenue: Number(data.total_revenue) || 0,
        cashPayments: 0,
        cashTotal: Number(data.cash_total) || 0,
        cardPayments: 0,
        cardTotal: Number(data.card_total) || 0,
        otherPayments: 0,
        otherTotal: Number(data.other_total) || 0,
      };

      set({ currentShift: shift });
      return true;
    } catch (e: any) {
      console.error('fetchOpenShift:', e.message);
      return false;
    }
  },
}));
