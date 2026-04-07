export interface Category {
  id: string;
  name: string;
  colorHex: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  hasModifiers?: boolean;
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
}

export interface Guest {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  guestId: string | null; // null = belongs to general "Заказ" section
  modifiers: Modifier[];
  comment?: string;
}

export type OrderStatus = 'active' | 'paid' | 'alert' | 'inactive';

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  waiter: string;
  openedAt: string;
  zone: string;
  type: string;
  totalAmount: number;
  tableNumber: string;
  tableId: string;       // links to FloorTable.id
  guestCount: number;
  guests: Guest[];
  items: OrderItem[];
  isQuickCheck?: boolean; // "Быстрый чек" — no table
  hasNote?: boolean;
  hasAlert?: boolean;
  hasEdit?: boolean;
}

export type TableStatus = 'free' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  number: string;
  status: TableStatus;
  capacity: number;
  zone: string;
  currentOrderId?: string;
  amount?: number;
  timeSeated?: string;
}

export type ActiveAction = 'modifiers' | 'quantity' | 'guest' | 'course' | 'combo' | 'move' | 'comment' | 'delete' | null;

export interface Shift {
  id: string;
  cashier: string;
  openedAt: Date;
  closedAt?: Date;
  startingCash: number;
  // Running totals (updated on each payment)
  totalOrders: number;
  totalRevenue: number;
  cashPayments: number;
  cashTotal: number;
  cardPayments: number;
  cardTotal: number;
  otherPayments: number;
  otherTotal: number;
}
