import { create } from 'zustand';
import { supabase } from '../utils/supabase';

export interface VenueTable {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  col: number;
  row: number;
  size: 'small' | 'regular' | 'wide' | 'tall' | 'bar';
}

export interface VenueZone {
  id: string;
  name: string;
  tables: VenueTable[];
  cols: number;
  rows: number;
}

interface VenueStoreState {
  venueId: string;
  zones: VenueZone[];
  waiters: { id: string; name: string; pin: string; role: string }[];
  isLoading: boolean;
  error: string | null;
  fetchVenue: () => Promise<void>;
}

const VENUE_ID = '00000000-0000-0000-0000-000000000010'; // MVP: hardcoded

export const useVenueStore = create<VenueStoreState>((set) => ({
  venueId: VENUE_ID,
  zones: [],
  waiters: [],
  isLoading: false,
  error: null,

  fetchVenue: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch zones
      const { data: zoneData, error: zoneError } = await supabase
        .from('zones')
        .select('id, name, grid_cols, grid_rows, sort_order')
        .eq('venue_id', VENUE_ID)
        .order('sort_order');

      if (zoneError) throw zoneError;

      // Fetch tables
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('id, zone_id, number, capacity, col, row, size')
        .eq('venue_id', VENUE_ID);

      if (tableError) throw tableError;

      // Fetch waiters (users for this venue)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, pin, role, user_venues!inner(venue_id)')
        .eq('user_venues.venue_id', VENUE_ID);

      if (userError) throw userError;

      // Build zones with tables
      const zones: VenueZone[] = (zoneData || []).map((z: any) => ({
        id: z.id,
        name: z.name,
        cols: z.grid_cols,
        rows: z.grid_rows,
        tables: (tableData || [])
          .filter((t: any) => t.zone_id === z.id)
          .map((t: any) => ({
            id: t.id,
            number: t.number,
            zone: z.name,
            capacity: t.capacity,
            col: t.col,
            row: t.row,
            size: t.size,
          })),
      }));

      const waiters = (userData || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        pin: u.pin,
        role: u.role,
      }));

      set({ zones, waiters, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch venue:', err.message);
      set({ error: err.message, isLoading: false });
    }
  },
}));
