-- Add metric unit columns to cars table
-- This migration adds metric versions of existing imperial measurements
-- All columns are nullable to preserve existing data

-- Add torque_metric column (Nm)
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS torque_metric NUMERIC;

-- Add top_speed_metric column (km/h)
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS top_speed_metric NUMERIC;

-- Add weight_metric column (kg)
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS weight_metric NUMERIC;

-- Add front_tire_pressure_metric column (bar)
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS front_tire_pressure_metric NUMERIC;

-- Add rear_tire_pressure_metric column (bar)
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS rear_tire_pressure_metric NUMERIC;

-- Add mileage_metric column (km)
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS mileage_metric NUMERIC;

-- Add comments for documentation
COMMENT ON COLUMN cars.torque_metric IS 'Torque in Newton-meters (metric unit)';
COMMENT ON COLUMN cars.top_speed_metric IS 'Top speed in km/h (metric unit)';
COMMENT ON COLUMN cars.weight_metric IS 'Weight in kilograms (metric unit)';
COMMENT ON COLUMN cars.front_tire_pressure_metric IS 'Front tire pressure in bar (metric unit)';
COMMENT ON COLUMN cars.rear_tire_pressure_metric IS 'Rear tire pressure in bar (metric unit)';
COMMENT ON COLUMN cars.mileage_metric IS 'Mileage in kilometers (metric unit)';

