export interface FloorTable {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  col: number;
  row: number;
  // small=1x1 circle, regular=2x1 pill, wide=3x1, tall=1x2, bar=1x3
  size: 'small' | 'regular' | 'wide' | 'tall' | 'bar';
}

export interface FloorZone {
  id: string;
  name: string;
  tables: FloorTable[];
  cols: number;
  rows: number;
}

// Size multipliers
export const SIZE_W: Record<string, number> = { small: 1, regular: 2, wide: 3, tall: 1, bar: 1 };
export const SIZE_H: Record<string, number> = { small: 1, regular: 1, wide: 1, tall: 2, bar: 3 };

// ── Основной зал (8 cols × 5 rows) ──
const mainTables: FloorTable[] = [
  // Back row — small round tables
  { id: 't1',  number: '1',  zone: 'Основной зал', capacity: 2, col: 0, row: 0, size: 'small' },
  { id: 't2',  number: '2',  zone: 'Основной зал', capacity: 2, col: 1, row: 0, size: 'small' },
  { id: 't5',  number: '5',  zone: 'Основной зал', capacity: 4, col: 3, row: 0, size: 'regular' },
  { id: 't9',  number: '9',  zone: 'Основной зал', capacity: 4, col: 7, row: 0, size: 'bar' },

  // Middle row — wide tables
  { id: 't3',  number: '3',  zone: 'Основной зал', capacity: 6, col: 0, row: 2, size: 'wide' },
  { id: 't7',  number: '7',  zone: 'Основной зал', capacity: 4, col: 4, row: 2, size: 'regular' },

  // Bottom row
  { id: 't4',  number: '4',  zone: 'Основной зал', capacity: 2, col: 0, row: 4, size: 'small' },
  { id: 't8',  number: '8',  zone: 'Основной зал', capacity: 2, col: 1, row: 4, size: 'small' },
  { id: 't10', number: '10', zone: 'Основной зал', capacity: 4, col: 4, row: 4, size: 'regular' },
];

// ── Веранда (6 cols × 4 rows) ──
const verandaTables: FloorTable[] = [
  { id: 'v1', number: '21', zone: 'Веранда', capacity: 6, col: 0, row: 0, size: 'wide' },
  { id: 'v2', number: '22', zone: 'Веранда', capacity: 4, col: 4, row: 0, size: 'regular' },

  { id: 'v3', number: '23', zone: 'Веранда', capacity: 2, col: 0, row: 2, size: 'small' },
  { id: 'v4', number: '24', zone: 'Веранда', capacity: 2, col: 1, row: 2, size: 'small' },
  { id: 'v5', number: '25', zone: 'Веранда', capacity: 2, col: 2, row: 2, size: 'small' },
  { id: 'v6', number: '26', zone: 'Веранда', capacity: 4, col: 4, row: 2, size: 'regular' },
];

export const floorZones: FloorZone[] = [
  { id: 'main', name: 'Основной зал', tables: mainTables, cols: 8, rows: 5 },
  { id: 'veranda', name: 'Веранда', tables: verandaTables, cols: 6, rows: 4 },
];
