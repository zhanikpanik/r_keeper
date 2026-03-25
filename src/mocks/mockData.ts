import { Category, Product, Order, Table } from '../types';

export const mockOrders: Order[] = [
  { id:'1',  number:'1',   status:'active',   waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:1200 },
  { id:'2',  number:'2',   status:'alert',    waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:6890, hasNote:true, hasAlert:true },
  { id:'3',  number:'3.1', status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:4700 },
  { id:'4',  number:'3.2', status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:6890 },
  { id:'5',  number:'3.3', status:'active',   waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:4700, hasNote:true },
  { id:'6',  number:'4',   status:'active',   waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:530,  hasNote:true },
  { id:'7',  number:'5',   status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:12560 },
  { id:'8',  number:'6',   status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:4700 },
  { id:'9',  number:'7',   status:'alert',    waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:6890, hasNote:true, hasAlert:true },
  { id:'10', number:'8',   status:'active',   waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:1200, hasNote:true },
  { id:'11', number:'9',   status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:6890 },
  { id:'12', number:'10',  status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:12560 },
  { id:'13', number:'11',  status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:6890, hasNote:true, hasAlert:true, hasEdit:true },
  { id:'14', number:'12',  status:'alert',    waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:6890, hasNote:true, hasAlert:true, hasEdit:true },
  { id:'15', number:'13',  status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:1200, hasNote:true, hasAlert:true, hasEdit:true },
  { id:'16', number:'14',  status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:4700 },
  { id:'17', number:'15',  status:'inactive', waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:12560, hasNote:true, hasAlert:true, hasEdit:true },
  { id:'18', number:'16',  status:'active',   waiter:'Иванов', openedAt:'16:30', zone:'Веранда', type:'Общий', totalAmount:1200 },
];

export const mockTables: Table[] = [
  // Zone: Основной зал
  { id: 't1', number: '1', status: 'occupied', capacity: 4, zone: 'Основной зал', amount: 1200, timeSeated: '16:30' },
  { id: 't2', number: '2', status: 'free', capacity: 2, zone: 'Основной зал' },
  { id: 't3', number: '3', status: 'free', capacity: 4, zone: 'Основной зал' },
  { id: 't4', number: '4', status: 'occupied', capacity: 6, zone: 'Основной зал', amount: 4500, timeSeated: '17:15' },
  { id: 't5', number: '5', status: 'reserved', capacity: 4, zone: 'Основной зал' },
  { id: 't6', number: '6', status: 'free', capacity: 4, zone: 'Основной зал' },
  { id: 't7', number: '7', status: 'free', capacity: 2, zone: 'Основной зал' },
  { id: 't8', number: '8', status: 'occupied', capacity: 4, zone: 'Основной зал', amount: 890, timeSeated: '18:05' },
  
  // Zone: Веранда
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
