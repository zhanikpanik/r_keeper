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
  id: string; // Unique ID for this specific line item
  product: Product;
  quantity: number;
  guestId: string | null; // null means it belongs to the general "Заказ"
  modifiers: Modifier[];
}

export type OrderStatus = 'active' | 'alert' | 'inactive';

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

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  waiter: string;
  openedAt: string;
  zone: string;
  type: string;
  totalAmount: number;
  hasNote?: boolean;
  hasAlert?: boolean;
  hasEdit?: boolean;
}

export type ActiveAction = 'modifiers' | 'quantity' | 'guest' | 'course' | 'combo' | 'move' | 'delete' | null;
