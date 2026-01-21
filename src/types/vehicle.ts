export type VehicleType = 'caminhao' | 'carro' | 'maquinario';
export type FuelType = 'gasolina' | 'diesel' | 'etanol';
export type OwnershipType = 'vg_cezar' | 'nova_mineracao' | 'outros';

export interface Vehicle {
  id: string;
  name: string;
  plate: string | null;
  type: VehicleType;
  fuel_type: FuelType;
  tank_capacity: number | null;
  uses_odometer: boolean;
  active: boolean;
  created_at: string;
  // New fields
  brand: string | null;
  model: string | null;
  year: number | null;
  year_model: number | null;
  current_km: number | null;
  renavam_serial: string | null;
  color: string | null;
  ownership: OwnershipType;
  notes: string | null;
  updated_at: string;
}

export interface FuelEntry {
  id: string;
  vehicle_id: string;
  date: string;
  odometer_value: number;
  liters: number;
  fuel_type: FuelType;
  price_per_liter: number | null;
  total_cost: number | null;
  operator_name: string | null;
  notes: string | null;
  created_at: string;
  // Joined data
  vehicle?: Vehicle;
}
