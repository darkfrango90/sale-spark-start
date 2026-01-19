export type VehicleType = 'caminhao' | 'carro' | 'maquinario';
export type FuelType = 'gasolina' | 'diesel';

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
