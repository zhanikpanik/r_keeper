import { Category, Product, Table } from '../types';

// Orders are now managed in the store (orderStore.ts) — this file only has tables and legacy data.

export const mockTables: Table[] = [
  { id: 't1', number: '1', status: 'occupied', capacity: 4, zone: 'Основной зал', amount: 1200, timeSeated: '16:30' },
  { id: 't2', number: '2', status: 'free', capacity: 2, zone: 'Основной зал' },
  { id: 't3', number: '3', status: 'free', capacity: 4, zone: 'Основной зал' },
  { id: 't4', number: '4', status: 'occupied', capacity: 6, zone: 'Основной зал', amount: 4500, timeSeated: '17:15' },
  { id: 't5', number: '5', status: 'reserved', capacity: 4, zone: 'Основной зал' },
  { id: 't6', number: '6', status: 'free', capacity: 4, zone: 'Основной зал' },
  { id: 't7', number: '7', status: 'free', capacity: 2, zone: 'Основной зал' },
  { id: 't8', number: '8', status: 'occupied', capacity: 4, zone: 'Основной зал', amount: 890, timeSeated: '18:05' },
  { id: 't9', number: '11', status: 'occupied', capacity: 4, zone: 'Веранда', amount: 2300, timeSeated: '16:45' },
  { id: 't10', number: '12', status: 'free', capacity: 4, zone: 'Веранда' },
  { id: 't11', number: '13', status: 'free', capacity: 4, zone: 'Веранда' },
  { id: 't12', number: '14', status: 'free', capacity: 2, zone: 'Веранда' },
  { id: 't13', number: '15', status: 'occupied', capacity: 4, zone: 'Веранда', amount: 6700, timeSeated: '15:20' },
];

export const categories: Category[] = [
  { id: 'coffee',   name: 'Кофе',     colorHex: '#5B4FE8' },
  { id: 'food',     name: 'Еда',      colorHex: '#1976D2' },
  { id: 'drinks',   name: 'Напитки',  colorHex: '#2E7D32' },
  { id: 'desserts', name: 'Десерты',  colorHex: '#6D4C41' },
];

export const products: Product[] = [
  { id: '1', categoryId: 'coffee',   name: 'Латте',              price: 250 },
  { id: '2', categoryId: 'coffee',   name: 'Капучино',           price: 220 },
  { id: '3', categoryId: 'coffee',   name: 'Американо',          price: 180 },
  { id: '4', categoryId: 'coffee',   name: 'Флэт уайт',          price: 240 },
  { id: '5', categoryId: 'coffee',   name: 'Раф',                price: 280 },
  { id: '6', categoryId: 'food',     name: 'Круассан',           price: 150 },
  { id: '7', categoryId: 'food',     name: 'Сэндвич с курицей',  price: 280 },
  { id: '8', categoryId: 'food',     name: 'Яичница',            price: 220 },
  { id: '9', categoryId: 'drinks',   name: 'Апельсиновый фреш',  price: 220 },
  { id: '10', categoryId: 'drinks',  name: 'Вода',               price: 80  },
  { id: '11', categoryId: 'desserts',name: 'Чизкейк',            price: 200 },
  { id: '12', categoryId: 'desserts',name: 'Тирамису',           price: 220 },
];
