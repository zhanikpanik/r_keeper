import { Category, Product, Modifier } from '../types';

// ── Categories (shown in middle column, 2-col grid) ──
export const menuCategories: Category[] = [
  { id: 'hot',      name: 'Горячее',  colorHex: '#1B5E20' },
  { id: 'kids',     name: 'Детское',  colorHex: '#1565C0' },
  { id: 'vegan',    name: 'Веганы',   colorHex: '#2E7D32' },
  { id: 'bar',      name: 'Бар',      colorHex: '#4527A0' },
  { id: 'pizza',    name: 'Пицца',    colorHex: '#BF360C' },
  { id: 'shashlik', name: 'Шашлык',   colorHex: '#5D4037' },
  { id: 'salads',   name: 'Салаты',   colorHex: '#00695C' },
  { id: 'soups',    name: 'Супы',     colorHex: '#AD1457' },
];

// ── Products per category ──
export const menuProducts: Record<string, Product[]> = {
  hot: [
    { id: 'h1',  categoryId: 'hot', name: 'Выгодная пара с барбекю', price: 230, hasModifiers: true },
    { id: 'h2',  categoryId: 'hot', name: 'Тройной барбекю',         price: 240, hasModifiers: true },
    { id: 'h3',  categoryId: 'hot', name: 'Три сыра',                price: 250 },
    { id: 'h4',  categoryId: 'hot', name: 'Карбонара',               price: 260, hasModifiers: true },
    { id: 'h5',  categoryId: 'hot', name: 'Курица гриль',            price: 270, hasModifiers: true },
    { id: 'h6',  categoryId: 'hot', name: 'Нарезка мясо',            price: 280 },
    { id: 'h7',  categoryId: 'hot', name: 'Цезарь с курицей',        price: 290, hasModifiers: true },
    { id: 'h8',  categoryId: 'hot', name: 'Мега Биф',                price: 300, hasModifiers: true },
    { id: 'h9',  categoryId: 'hot', name: 'Нарезка рыба',            price: 310 },
    { id: 'h10', categoryId: 'hot', name: 'Оливье',                  price: 320 },
    { id: 'h11', categoryId: 'hot', name: 'Биг Мак',                 price: 330, hasModifiers: true },
    { id: 'h12', categoryId: 'hot', name: 'Нарезка сыр',             price: 340 },
    { id: 'h13', categoryId: 'hot', name: 'Крабовый',                price: 350 },
    { id: 'h14', categoryId: 'hot', name: 'Шаурма',                  price: 360, hasModifiers: true },
  ],
  kids: [
    { id: 'k1', categoryId: 'kids', name: 'Наггетсы',       price: 150 },
    { id: 'k2', categoryId: 'kids', name: 'Картофель фри',  price: 100 },
    { id: 'k3', categoryId: 'kids', name: 'Мини бургер',    price: 180 },
    { id: 'k4', categoryId: 'kids', name: 'Сок яблочный',   price: 90 },
    { id: 'k5', categoryId: 'kids', name: 'Блинчики',       price: 130 },
  ],
  vegan: [
    { id: 'v1', categoryId: 'vegan', name: 'Фалафель',        price: 220 },
    { id: 'v2', categoryId: 'vegan', name: 'Хумус',           price: 180 },
    { id: 'v3', categoryId: 'vegan', name: 'Салат с тофу',    price: 250 },
    { id: 'v4', categoryId: 'vegan', name: 'Овощи гриль',    price: 200 },
  ],
  bar: [
    { id: 'b1', categoryId: 'bar', name: 'Кока-кола',     price: 90 },
    { id: 'b2', categoryId: 'bar', name: 'Латте',         price: 150 },
    { id: 'b3', categoryId: 'bar', name: 'Эспрессо',      price: 120 },
    { id: 'b4', categoryId: 'bar', name: 'Чай зелёный',   price: 80 },
    { id: 'b5', categoryId: 'bar', name: 'Лимонад',       price: 130 },
    { id: 'b6', categoryId: 'bar', name: 'Смузи',         price: 200 },
    { id: 'b7', categoryId: 'bar', name: 'Морс',          price: 110 },
  ],
  pizza: [
    { id: 'pz1', categoryId: 'pizza', name: 'Маргарита',     price: 350, hasModifiers: true },
    { id: 'pz2', categoryId: 'pizza', name: 'Пепперони',     price: 400, hasModifiers: true },
    { id: 'pz3', categoryId: 'pizza', name: '4 сыра',        price: 420, hasModifiers: true },
    { id: 'pz4', categoryId: 'pizza', name: 'Гавайская',     price: 380, hasModifiers: true },
    { id: 'pz5', categoryId: 'pizza', name: 'Карбонара',     price: 430, hasModifiers: true },
    { id: 'pz6', categoryId: 'pizza', name: 'Мясная',        price: 450, hasModifiers: true },
  ],
  shashlik: [
    { id: 's1', categoryId: 'shashlik', name: 'Свинина',       price: 350 },
    { id: 's2', categoryId: 'shashlik', name: 'Курица',        price: 280 },
    { id: 's3', categoryId: 'shashlik', name: 'Баранина',      price: 420 },
    { id: 's4', categoryId: 'shashlik', name: 'Люля-кебаб',    price: 300 },
    { id: 's5', categoryId: 'shashlik', name: 'Овощи',         price: 180 },
  ],
  salads: [
    { id: 'sa1', categoryId: 'salads', name: 'Цезарь',        price: 280 },
    { id: 'sa2', categoryId: 'salads', name: 'Греческий',     price: 250 },
    { id: 'sa3', categoryId: 'salads', name: 'Оливье',        price: 220 },
    { id: 'sa4', categoryId: 'salads', name: 'Винегрет',      price: 190 },
  ],
  soups: [
    { id: 'sp1', categoryId: 'soups', name: 'Борщ',          price: 220 },
    { id: 'sp2', categoryId: 'soups', name: 'Том Ям',        price: 350 },
    { id: 'sp3', categoryId: 'soups', name: 'Солянка',       price: 260 },
    { id: 'sp4', categoryId: 'soups', name: 'Куриный',       price: 180 },
  ],
};

// ── Modifier groups (shown in right column when item selected + "Модификатор" active) ──
export interface ModifierGroup {
  id: string;
  name: string;
  modifiers: Modifier[];
}

export const modifierGroups: ModifierGroup[] = [
  {
    id: 'filling',
    name: 'Начинка',
    modifiers: [
      { id: 'm1', name: 'Лук',       price: 0 },
      { id: 'm2', name: 'Помидор',   price: 30 },
      { id: 'm3', name: 'Огурец',    price: 20 },
      { id: 'm4', name: 'Сыр',       price: 40 },
      { id: 'm5', name: 'Бекон',     price: 60 },
      { id: 'm6', name: 'Грибы',     price: 30 },
    ],
  },
  {
    id: 'sauce',
    name: 'Соус',
    modifiers: [
      { id: 'ms1', name: 'Кетчуп',     price: 0 },
      { id: 'ms2', name: 'Майонез',    price: 0 },
      { id: 'ms3', name: 'Горчица',    price: 0 },
      { id: 'ms4', name: 'Барбекю',    price: 20 },
      { id: 'ms5', name: 'Сырный',     price: 30 },
    ],
  },
  {
    id: 'extra',
    name: 'Допы',
    modifiers: [
      { id: 'me1', name: 'Двойная порция', price: 100 },
      { id: 'me2', name: 'Без глютена',    price: 50 },
      { id: 'me3', name: 'Острый',         price: 0 },
    ],
  },
];

// ── Product color mapping (which color to use for product cards) ──
// In the reference, products in "Горячее" alternate between blue and green
export const getCategoryColor = (categoryId: string): string => {
  const cat = menuCategories.find(c => c.id === categoryId);
  return cat?.colorHex || '#333333';
};

// Product cards cycle through blue/green shades within a category
const PRODUCT_COLORS = ['#1B5E20', '#0D47A1', '#1565C0', '#2E7D32', '#1B5E20', '#0D47A1'];
export const getProductColor = (index: number): string => {
  return PRODUCT_COLORS[index % PRODUCT_COLORS.length];
};
