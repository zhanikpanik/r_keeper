export type TableSize = 'regular' | 'large';

export interface FloorTable {
  id: string;
  number: string;
  size: TableSize;
  col: number;
  row: number;
  zone: string;
  capacity: number;
}

export const GRID = {
  gap: 8,
};

// ── Основной зал (10 cols × 7 rows) ──
//
// Imagine looking down at the restaurant from above:
//
//    ╔═══════════════════════════════════════════════╗
//    ║  [VIP 5][VIP 5]    [VIP 1][VIP 1]       [ 9]║  ← back wall, VIP + booth
//    ║                                          [ 8]║  ← right wall booths
//    ║     [ 2]      [ 3]      [ 7]             [11]║  ← center dining
//    ║                                              ║
//    ║          [10]      [ 4]                       ║  ← center dining
//    ║                                              ║
//    ║  [17] [16] [15] [14] [13] [12]               ║  ← bar counter row
//    ╚═══════════════════════════════════════════════╝
//          entrance ↓

export const floorTablesMain: FloorTable[] = [
  // Back wall — VIP large tables
  { id: 't5',  number: '5',  size: 'large',   col: 0, row: 0, zone: 'Основной зал', capacity: 6 },
  { id: 't1',  number: '1',  size: 'large',   col: 3, row: 0, zone: 'Основной зал', capacity: 6 },

  // Right wall — booths (stacked vertically)
  { id: 't9',  number: '9',  size: 'regular', col: 8, row: 0, zone: 'Основной зал', capacity: 4 },
  { id: 't8',  number: '8',  size: 'regular', col: 8, row: 1, zone: 'Основной зал', capacity: 4 },
  { id: 't11', number: '11', size: 'regular', col: 8, row: 2, zone: 'Основной зал', capacity: 4 },

  // Center dining — scattered with gaps
  { id: 't2',  number: '2',  size: 'regular', col: 1, row: 2, zone: 'Основной зал', capacity: 4 },
  { id: 't3',  number: '3',  size: 'regular', col: 3, row: 2, zone: 'Основной зал', capacity: 4 },
  { id: 't7',  number: '7',  size: 'regular', col: 5, row: 2, zone: 'Основной зал', capacity: 2 },

  { id: 't10', number: '10', size: 'regular', col: 2, row: 4, zone: 'Основной зал', capacity: 4 },
  { id: 't4',  number: '4',  size: 'regular', col: 4, row: 4, zone: 'Основной зал', capacity: 4 },

  // Bar counter — bottom row, tight together
  { id: 't17', number: '17', size: 'regular', col: 0, row: 6, zone: 'Основной зал', capacity: 2 },
  { id: 't16', number: '16', size: 'regular', col: 1, row: 6, zone: 'Основной зал', capacity: 2 },
  { id: 't15', number: '15', size: 'regular', col: 2, row: 6, zone: 'Основной зал', capacity: 2 },
  { id: 't14', number: '14', size: 'regular', col: 3, row: 6, zone: 'Основной зал', capacity: 2 },
  { id: 't13', number: '13', size: 'regular', col: 4, row: 6, zone: 'Основной зал', capacity: 2 },
  { id: 't12', number: '12', size: 'regular', col: 5, row: 6, zone: 'Основной зал', capacity: 2 },
];

// ── Веранда (7 cols × 5 rows) ──
//
//    ╔═══════════════════════════════╗
//    ║ [21][21]   [22][22]   [23]   ║  ← big tables by the railing
//    ║                              ║
//    ║    [24]       [25]     [26]  ║  ← middle
//    ║                              ║
//    ║  [27]    [28]    [29]        ║  ← small 2-person tables
//    ╚═══════════════════════════════╝

export const floorTablesVeranda: FloorTable[] = [
  // Row 0: large tables along railing
  { id: 'v1', number: '21', size: 'large',   col: 0, row: 0, zone: 'Веранда', capacity: 6 },
  { id: 'v2', number: '22', size: 'large',   col: 3, row: 0, zone: 'Веранда', capacity: 6 },
  { id: 'v3', number: '23', size: 'regular', col: 6, row: 0, zone: 'Веранда', capacity: 4 },

  // Row 2: middle tables with spacing
  { id: 'v4', number: '24', size: 'regular', col: 1, row: 2, zone: 'Веранда', capacity: 4 },
  { id: 'v5', number: '25', size: 'regular', col: 3, row: 2, zone: 'Веранда', capacity: 4 },
  { id: 'v6', number: '26', size: 'regular', col: 5, row: 2, zone: 'Веранда', capacity: 4 },

  // Row 4: small tables
  { id: 'v7', number: '27', size: 'regular', col: 0, row: 4, zone: 'Веранда', capacity: 2 },
  { id: 'v8', number: '28', size: 'regular', col: 2, row: 4, zone: 'Веранда', capacity: 2 },
  { id: 'v9', number: '29', size: 'regular', col: 4, row: 4, zone: 'Веранда', capacity: 2 },
];

export const floorZones = [
  { id: 'main', name: 'Основной зал', tables: floorTablesMain },
  { id: 'veranda', name: 'Веранда', tables: floorTablesVeranda },
];
