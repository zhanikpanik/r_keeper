import { create } from 'zustand';
import { Shift } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface ShiftStoreState {
  currentShift: Shift | null;
  shiftHistory: Shift[];

  openShift: (cashier: string, startingCash: number) => void;
  closeShift: () => Shift | null;
  recordPayment: (method: 'cash' | 'card' | 'other', amount: number) => void;
  isShiftOpen: () => boolean;
}

export const useShiftStore = create<ShiftStoreState>((set, get) => ({
  currentShift: null,
  shiftHistory: [],

  openShift: (cashier: string, startingCash: number) => {
    const shift: Shift = {
      id: generateId(),
      cashier,
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
}));
