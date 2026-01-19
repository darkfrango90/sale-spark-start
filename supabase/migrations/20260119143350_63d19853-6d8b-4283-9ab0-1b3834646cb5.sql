-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  plate TEXT,
  type TEXT NOT NULL CHECK (type IN ('caminhao', 'carro', 'maquinario')),
  fuel_type TEXT NOT NULL DEFAULT 'diesel' CHECK (fuel_type IN ('gasolina', 'diesel')),
  tank_capacity NUMERIC,
  uses_odometer BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fuel_entries table
CREATE TABLE public.fuel_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  odometer_value NUMERIC NOT NULL,
  liters NUMERIC NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasolina', 'diesel')),
  price_per_liter NUMERIC,
  total_cost NUMERIC,
  operator_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicles (public access for now, can be restricted later)
CREATE POLICY "Allow all access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on fuel_entries
ALTER TABLE public.fuel_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for fuel_entries
CREATE POLICY "Allow all access to fuel_entries" ON public.fuel_entries FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_fuel_entries_vehicle_id ON public.fuel_entries(vehicle_id);
CREATE INDEX idx_fuel_entries_date ON public.fuel_entries(date DESC);
CREATE INDEX idx_vehicles_active ON public.vehicles(active) WHERE active = true;