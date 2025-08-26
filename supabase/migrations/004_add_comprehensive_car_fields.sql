-- Migration 004: Add comprehensive car specification fields
-- This adds many more detailed fields for comprehensive car documentation

-- Engine Specifications
ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_code TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS drivetrain TEXT;

-- Performance Specifications  
ALTER TABLE cars ADD COLUMN IF NOT EXISTS weight INTEGER; -- in lbs
ALTER TABLE cars ADD COLUMN IF NOT EXISTS power_to_weight TEXT;

-- Brake System
ALTER TABLE cars ADD COLUMN IF NOT EXISTS brake_caliper_brand TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS brake_lines TEXT;

-- Suspension
ALTER TABLE cars ADD COLUMN IF NOT EXISTS coilovers TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS sway_bars TEXT;

-- Wheels and Tires
ALTER TABLE cars ADD COLUMN IF NOT EXISTS wheel_offset TEXT;
-- Front Tires
ALTER TABLE cars ADD COLUMN IF NOT EXISTS front_tire_size TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS front_tire_brand TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS front_tire_model TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS front_tire_pressure INTEGER;
-- Rear Tires
ALTER TABLE cars ADD COLUMN IF NOT EXISTS rear_tire_size TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS rear_tire_brand TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS rear_tire_model TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS rear_tire_pressure INTEGER;

-- Exterior
ALTER TABLE cars ADD COLUMN IF NOT EXISTS wrap_color TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS carbon_fiber_parts TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS lighting TEXT;

-- Interior
ALTER TABLE cars ADD COLUMN IF NOT EXISTS steering_wheel TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS shift_knob TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS gauges TEXT;

-- Additional Details
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vin TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS mileage INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS fuel_economy TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS maintenance_history TEXT;

-- Add comments for documentation
COMMENT ON COLUMN cars.engine_code IS 'Engine code/designation (e.g., B58, LS3, K20)';
COMMENT ON COLUMN cars.drivetrain IS 'Drivetrain configuration (AWD, RWD, FWD)';
COMMENT ON COLUMN cars.weight IS 'Vehicle weight in pounds';
COMMENT ON COLUMN cars.power_to_weight IS 'Power to weight ratio (e.g., 10.2 lbs/hp)';
COMMENT ON COLUMN cars.brake_caliper_brand IS 'Brake caliper brand/manufacturer';
COMMENT ON COLUMN cars.brake_lines IS 'Brake line specifications';
COMMENT ON COLUMN cars.coilovers IS 'Coilover suspension details';
COMMENT ON COLUMN cars.sway_bars IS 'Sway bar specifications';
COMMENT ON COLUMN cars.wheel_offset IS 'Wheel offset measurement';
COMMENT ON COLUMN cars.front_tire_size IS 'Front tire size specification';
COMMENT ON COLUMN cars.front_tire_brand IS 'Front tire brand/manufacturer';
COMMENT ON COLUMN cars.front_tire_model IS 'Front tire model name';
COMMENT ON COLUMN cars.front_tire_pressure IS 'Front tire pressure in PSI';
COMMENT ON COLUMN cars.rear_tire_size IS 'Rear tire size specification';
COMMENT ON COLUMN cars.rear_tire_brand IS 'Rear tire brand/manufacturer';
COMMENT ON COLUMN cars.rear_tire_model IS 'Rear tire model name';
COMMENT ON COLUMN cars.rear_tire_pressure IS 'Rear tire pressure in PSI';
COMMENT ON COLUMN cars.wrap_color IS 'Vehicle wrap color if applicable';
COMMENT ON COLUMN cars.carbon_fiber_parts IS 'Carbon fiber components list';
COMMENT ON COLUMN cars.lighting IS 'Custom lighting modifications';
COMMENT ON COLUMN cars.steering_wheel IS 'Steering wheel specifications';
COMMENT ON COLUMN cars.shift_knob IS 'Shift knob details';
COMMENT ON COLUMN cars.gauges IS 'Custom gauge specifications';
COMMENT ON COLUMN cars.vin IS 'Vehicle Identification Number';
COMMENT ON COLUMN cars.mileage IS 'Current mileage';
COMMENT ON COLUMN cars.fuel_economy IS 'Fuel economy rating';
COMMENT ON COLUMN cars.maintenance_history IS 'Maintenance history notes';
