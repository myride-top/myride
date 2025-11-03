import { Car } from '@/lib/types/database'
import { SpecificationSection } from './specification-section'
import { useUnitPreference } from '@/lib/context/unit-context'
import { unitConversions } from '@/lib/utils'

interface CarSpecificationsProps {
  car: Car
  className?: string
}

type SpecificationItem = {
  key: string
  label: string
  value: string | number | null
  unit?: string
  unitType?: 'torque' | 'weight' | 'pressure' | 'speed' | 'distance'
}

export const CarSpecifications = ({
  car,
  className,
}: CarSpecificationsProps) => {
  const { unitPreference } = useUnitPreference()

  const basicInfo: SpecificationItem[] = [
    { key: 'make', label: 'Make', value: car.make },
    { key: 'model', label: 'Model', value: car.model },
    { key: 'year', label: 'Year', value: car.year },
    { key: 'description', label: 'Description', value: car.description },
  ]

  const engineSpecs: SpecificationItem[] = [
    {
      key: 'engine_displacement',
      label: 'Engine Displacement',
      value: car.engine_displacement,
      unit: 'L',
    },
    {
      key: 'engine_cylinders',
      label: 'Cylinders',
      value: car.engine_cylinders,
    },
    { key: 'engine_code', label: 'Engine Code', value: car.engine_code },
    {
      key: 'horsepower',
      label: 'Horsepower',
      value: car.horsepower,
      unit: 'HP',
    },
    { 
      key: 'torque', 
      label: 'Torque', 
      value: unitPreference === 'metric' 
        ? (car.torque_metric ?? (car.torque ? unitConversions.torque.imperialToMetric(car.torque) : null))
        : (car.torque ?? (car.torque_metric ? unitConversions.torque.metricToImperial(car.torque_metric) : null)),
      unitType: 'torque' 
    },
    { key: 'engine_type', label: 'Engine Type', value: car.engine_type },
    { key: 'fuel_type', label: 'Fuel Type', value: car.fuel_type },
    { key: 'transmission', label: 'Transmission', value: car.transmission },
    { key: 'drivetrain', label: 'Drivetrain', value: car.drivetrain },
    {
      key: 'zero_to_sixty',
      label: unitPreference === 'metric' ? '0-100 km/h' : '0-60 mph',
      value: car.zero_to_sixty,
      unit: 's',
    },
    {
      key: 'top_speed',
      label: 'Top Speed',
      value: unitPreference === 'metric'
        ? (car.top_speed_metric ?? (car.top_speed ? unitConversions.speed.imperialToMetric(car.top_speed) : null))
        : (car.top_speed ?? (car.top_speed_metric ? unitConversions.speed.metricToImperial(car.top_speed_metric) : null)),
      unitType: 'speed',
    },
    {
      key: 'quarter_mile',
      label: '0-400m',
      value: car.quarter_mile,
      unit: 's',
    },
    { 
      key: 'weight', 
      label: 'Weight', 
      value: unitPreference === 'metric'
        ? (car.weight_metric ?? (car.weight ? unitConversions.weight.imperialToMetric(car.weight) : null))
        : (car.weight ?? (car.weight_metric ? unitConversions.weight.metricToImperial(car.weight_metric) : null)),
      unitType: 'weight' 
    },
    {
      key: 'power_to_weight',
      label: 'Power to Weight Ratio',
      value: car.power_to_weight,
    },
  ]

  const wheelsAndTires: SpecificationItem[] = [
    { key: 'wheel_size', label: 'Wheel Size', value: car.wheel_size },
    { key: 'wheel_brand', label: 'Wheel Brand', value: car.wheel_brand },
    {
      key: 'wheel_material',
      label: 'Wheel Material',
      value: car.wheel_material,
    },
    { key: 'wheel_offset', label: 'Wheel Offset', value: car.wheel_offset },
    {
      key: 'front_tire_size',
      label: 'Front Tire Size',
      value: car.front_tire_size,
    },
    {
      key: 'front_tire_brand',
      label: 'Front Tire Brand',
      value: car.front_tire_brand,
    },
    {
      key: 'front_tire_model',
      label: 'Front Tire Model',
      value: car.front_tire_model,
    },
    {
      key: 'front_tire_pressure',
      label: 'Front Tire Pressure',
      value: unitPreference === 'metric'
        ? (car.front_tire_pressure_metric ?? (car.front_tire_pressure ? unitConversions.pressure.imperialToMetric(car.front_tire_pressure) : null))
        : (car.front_tire_pressure ?? (car.front_tire_pressure_metric ? unitConversions.pressure.metricToImperial(car.front_tire_pressure_metric) : null)),
      unitType: 'pressure',
    },
    {
      key: 'rear_tire_size',
      label: 'Rear Tire Size',
      value: car.rear_tire_size,
    },
    {
      key: 'rear_tire_brand',
      label: 'Rear Tire Brand',
      value: car.rear_tire_brand,
    },
    {
      key: 'rear_tire_model',
      label: 'Rear Tire Model',
      value: car.rear_tire_model,
    },
    {
      key: 'rear_tire_pressure',
      label: 'Rear Tire Pressure',
      value: unitPreference === 'metric'
        ? (car.rear_tire_pressure_metric ?? (car.rear_tire_pressure ? unitConversions.pressure.imperialToMetric(car.rear_tire_pressure) : null))
        : (car.rear_tire_pressure ?? (car.rear_tire_pressure_metric ? unitConversions.pressure.metricToImperial(car.rear_tire_pressure_metric) : null)),
      unitType: 'pressure',
    },
  ]

  const brakes: SpecificationItem[] = [
    { key: 'front_brakes', label: 'Front Brakes', value: car.front_brakes },
    { key: 'rear_brakes', label: 'Rear Brakes', value: car.rear_brakes },
    { key: 'brake_rotors', label: 'Rotors', value: car.brake_rotors },
    {
      key: 'brake_caliper_brand',
      label: 'Caliper Brand',
      value: car.brake_caliper_brand,
    },
    { key: 'brake_lines', label: 'Brake Lines', value: car.brake_lines },
  ]

  const suspension: SpecificationItem[] = [
    {
      key: 'front_suspension',
      label: 'Front Suspension',
      value: car.front_suspension,
    },
    {
      key: 'rear_suspension',
      label: 'Rear Suspension',
      value: car.rear_suspension,
    },
    {
      key: 'suspension_type',
      label: 'Suspension Type',
      value: car.suspension_type,
    },
    { key: 'ride_height', label: 'Ride Height', value: car.ride_height },
    { key: 'coilovers', label: 'Coilovers', value: car.coilovers },
    { key: 'sway_bars', label: 'Sway Bars', value: car.sway_bars },
  ]

  const exterior: SpecificationItem[] = [
    { key: 'body_kit', label: 'Body Kit', value: car.body_kit },
    { key: 'paint_color', label: 'Paint Color', value: car.paint_color },
    { key: 'paint_type', label: 'Paint Type', value: car.paint_type },
    { key: 'wrap_color', label: 'Wrap Color', value: car.wrap_color },
    {
      key: 'carbon_fiber_parts',
      label: 'Carbon Fiber Parts',
      value: car.carbon_fiber_parts,
    },
    { key: 'lighting', label: 'Lighting', value: car.lighting },
  ]

  const interior: SpecificationItem[] = [
    {
      key: 'interior_color',
      label: 'Interior Color',
      value: car.interior_color,
    },
    {
      key: 'interior_material',
      label: 'Interior Material',
      value: car.interior_material,
    },
    { key: 'seats', label: 'Seats', value: car.seats },
    {
      key: 'steering_wheel',
      label: 'Steering Wheel',
      value: car.steering_wheel,
    },
    { key: 'shift_knob', label: 'Shift Knob', value: car.shift_knob },
    { key: 'gauges', label: 'Gauges', value: car.gauges },
  ]

  const additionalDetails: SpecificationItem[] = [
    {
      key: 'mileage',
      label: 'Mileage',
      value: unitPreference === 'metric'
        ? (car.mileage_metric ?? (car.mileage ? unitConversions.distance.imperialToMetric(car.mileage) : null))
        : (car.mileage ?? (car.mileage_metric ? unitConversions.distance.metricToImperial(car.mileage_metric) : null)),
      unitType: 'distance',
    },
    { key: 'fuel_economy', label: 'Fuel Economy', value: car.fuel_economy },
    { key: 'vin', label: 'VIN', value: car.vin },
    {
      key: 'maintenance_history',
      label: 'Maintenance History',
      value: car.maintenance_history,
    },
    {
      key: 'modifications',
      label: 'Modifications',
      value:
        car.modifications && car.modifications.length > 0
          ? car.modifications.join(', ')
          : null,
    },
    {
      key: 'dyno_results',
      label: 'Dyno Results',
      value: car.dyno_results,
    },
  ]

  const buildStory: SpecificationItem[] = [
    { key: 'build_story', label: 'Build Story', value: car.build_story },
    {
      key: 'build_start_date',
      label: 'Build Start Date',
      value: car.build_start_date,
    },
    {
      key: 'total_build_cost',
      label: 'Total Build Cost',
      value: car.total_build_cost
        ? `$${car.total_build_cost.toLocaleString()}`
        : null,
    },
    { key: 'inspiration', label: 'Inspiration', value: car.inspiration },
  ]

  const socialLinks: SpecificationItem[] = [
    {
      key: 'instagram_handle',
      label: 'Instagram',
      value: car.instagram_handle
        ? `@${car.instagram_handle.replace('@', '')}`
        : null,
    },
    {
      key: 'youtube_channel',
      label: 'YouTube',
      value: car.youtube_channel,
    },
    {
      key: 'build_thread_url',
      label: 'Build Thread',
      value: car.build_thread_url,
    },
    {
      key: 'website_url',
      label: 'Website',
      value: car.website_url,
    },
  ]

  return (
    <div className={className}>
      <h2 className='text-2xl font-bold text-foreground mb-6'>
        Specifications
      </h2>

      <div className='bg-card shadow rounded-lg divide-y divide-border'>
        {/* Basic Information - Always show since it has required fields */}
        <div className='p-6'>
          <SpecificationSection
            title='Basic Information'
            specifications={basicInfo}
          />
        </div>

        {/* Build Story Section - Only show if there's content */}
        {buildStory.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title='Build Story & Project Info'
              specifications={buildStory}
            />
          </div>
        )}

        {/* Engine & Performance - Only show if there's content */}
        {engineSpecs.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title='Engine & Performance'
              specifications={engineSpecs}
            />
          </div>
        )}

        {/* Wheels & Tires - Only show if there's content */}
        {wheelsAndTires.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title='Wheels & Tires'
              specifications={wheelsAndTires}
            />
          </div>
        )}

        {/* Brake System - Only show if there's content */}
        {brakes.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title='Brake System'
              specifications={brakes}
            />
          </div>
        )}

        {/* Suspension - Only show if there's content */}
        {suspension.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title='Suspension'
              specifications={suspension}
            />
          </div>
        )}

        {/* Exterior - Only show if there's content */}
        {exterior.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection title='Exterior' specifications={exterior} />
          </div>
        )}

        {/* Interior - Only show if there's content */}
        {interior.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection title='Interior' specifications={interior} />
          </div>
        )}

        {/* Additional Details - Only show if there's content */}
        {additionalDetails.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title='Additional Details'
              specifications={additionalDetails}
            />
          </div>
        )}

        {/* Social Links Section - Only show if there's content */}
        {socialLinks.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title='Social & Links'
              specifications={socialLinks}
            />
          </div>
        )}

        {/* Build Goals Section - Only show if there are goals */}
        {car.build_goals && car.build_goals.length > 0 && (
          <div className='p-6'>
            <h3 className='text-lg font-medium text-foreground mb-4'>
              Build Goals
            </h3>
            <ul className='space-y-2'>
              {car.build_goals.map((goal, index) => (
                <li key={index} className='text-sm text-foreground'>
                  • {goal}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
