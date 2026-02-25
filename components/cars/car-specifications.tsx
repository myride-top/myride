import { Car } from '@/lib/types/database'
import { SpecificationSection } from './specification-section'
import { useUnitPreference } from '@/lib/context/unit-context'
import { unitConversions } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/provider'

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
  const { t } = useI18n()

  const getSpecLabel = (key: string, fallback: string) =>
    t(`carDetail.specs.fields.${key}`, fallback)

  const getSectionLabel = (key: string, fallback: string) =>
    t(`carDetail.specs.sections.${key}`, fallback)

  const basicInfo: SpecificationItem[] = [
    { key: 'make', label: getSpecLabel('make', 'Make'), value: car.make },
    { key: 'model', label: getSpecLabel('model', 'Model'), value: car.model },
    { key: 'year', label: getSpecLabel('year', 'Year'), value: car.year },
    {
      key: 'description',
      label: getSpecLabel('description', 'Description'),
      value: car.description,
    },
  ]

  const engineSpecs: SpecificationItem[] = [
    {
      key: 'engine_displacement',
      label: getSpecLabel('engine_displacement', 'Engine Displacement'),
      value: car.engine_displacement,
      unit: 'L',
    },
    {
      key: 'engine_cylinders',
      label: getSpecLabel('engine_cylinders', 'Cylinders'),
      value: car.engine_cylinders,
    },
    {
      key: 'engine_code',
      label: getSpecLabel('engine_code', 'Engine Code'),
      value: car.engine_code,
    },
    {
      key: 'horsepower',
      label: getSpecLabel('horsepower', 'Horsepower'),
      value: car.horsepower,
      unit: 'HP',
    },
    {
      key: 'torque',
      label: getSpecLabel('torque', 'Torque'),
      value:
        unitPreference === 'metric'
          ? car.torque_metric ??
            (car.torque
              ? unitConversions.torque.imperialToMetric(car.torque)
              : null)
          : car.torque ??
            (car.torque_metric
              ? unitConversions.torque.metricToImperial(car.torque_metric)
              : null),
      unitType: 'torque',
    },
    {
      key: 'engine_type',
      label: getSpecLabel('engine_type', 'Engine Type'),
      value: car.engine_type,
    },
    {
      key: 'fuel_type',
      label: getSpecLabel('fuel_type', 'Fuel Type'),
      value: car.fuel_type,
    },
    {
      key: 'transmission',
      label: getSpecLabel('transmission', 'Transmission'),
      value: car.transmission,
    },
    {
      key: 'drivetrain',
      label: getSpecLabel('drivetrain', 'Drivetrain'),
      value: car.drivetrain,
    },
    {
      key: 'zero_to_sixty',
      label:
        unitPreference === 'metric'
          ? getSpecLabel('zero_to_sixty_metric', '0-100 km/h')
          : getSpecLabel('zero_to_sixty_imperial', '0-60 mph'),
      value: car.zero_to_sixty,
      unit: 's',
    },
    {
      key: 'top_speed',
      label: getSpecLabel('top_speed', 'Top Speed'),
      value:
        unitPreference === 'metric'
          ? car.top_speed_metric ??
            (car.top_speed
              ? unitConversions.speed.imperialToMetric(car.top_speed)
              : null)
          : car.top_speed ??
            (car.top_speed_metric
              ? unitConversions.speed.metricToImperial(car.top_speed_metric)
              : null),
      unitType: 'speed',
    },
    {
      key: 'quarter_mile',
      label: getSpecLabel('quarter_mile', '0-400m'),
      value: car.quarter_mile,
      unit: 's',
    },
    {
      key: 'weight',
      label: getSpecLabel('weight', 'Weight'),
      value:
        unitPreference === 'metric'
          ? car.weight_metric ??
            (car.weight
              ? unitConversions.weight.imperialToMetric(car.weight)
              : null)
          : car.weight ??
            (car.weight_metric
              ? unitConversions.weight.metricToImperial(car.weight_metric)
              : null),
      unitType: 'weight',
    },
    {
      key: 'power_to_weight',
      label: getSpecLabel('power_to_weight', 'Power to Weight Ratio'),
      value: car.power_to_weight,
    },
  ]

  const wheelsAndTires: SpecificationItem[] = [
    {
      key: 'wheel_size',
      label: getSpecLabel('wheel_size', 'Wheel Size'),
      value: car.wheel_size,
    },
    {
      key: 'wheel_brand',
      label: getSpecLabel('wheel_brand', 'Wheel Brand'),
      value: car.wheel_brand,
    },
    {
      key: 'wheel_material',
      label: getSpecLabel('wheel_material', 'Wheel Material'),
      value: car.wheel_material,
    },
    {
      key: 'wheel_offset',
      label: getSpecLabel('wheel_offset', 'Wheel Offset'),
      value: car.wheel_offset,
    },
    {
      key: 'front_tire_size',
      label: getSpecLabel('front_tire_size', 'Front Tire Size'),
      value: car.front_tire_size,
    },
    {
      key: 'front_tire_brand',
      label: getSpecLabel('front_tire_brand', 'Front Tire Brand'),
      value: car.front_tire_brand,
    },
    {
      key: 'front_tire_model',
      label: getSpecLabel('front_tire_model', 'Front Tire Model'),
      value: car.front_tire_model,
    },
    {
      key: 'front_tire_pressure',
      label: getSpecLabel('front_tire_pressure', 'Front Tire Pressure'),
      value:
        unitPreference === 'metric'
          ? car.front_tire_pressure_metric ??
            (car.front_tire_pressure
              ? unitConversions.pressure.imperialToMetric(car.front_tire_pressure)
              : null)
          : car.front_tire_pressure ??
            (car.front_tire_pressure_metric
              ? unitConversions.pressure.metricToImperial(car.front_tire_pressure_metric)
              : null),
      unitType: 'pressure',
    },
    {
      key: 'rear_tire_size',
      label: getSpecLabel('rear_tire_size', 'Rear Tire Size'),
      value: car.rear_tire_size,
    },
    {
      key: 'rear_tire_brand',
      label: getSpecLabel('rear_tire_brand', 'Rear Tire Brand'),
      value: car.rear_tire_brand,
    },
    {
      key: 'rear_tire_model',
      label: getSpecLabel('rear_tire_model', 'Rear Tire Model'),
      value: car.rear_tire_model,
    },
    {
      key: 'rear_tire_pressure',
      label: getSpecLabel('rear_tire_pressure', 'Rear Tire Pressure'),
      value:
        unitPreference === 'metric'
          ? car.rear_tire_pressure_metric ??
            (car.rear_tire_pressure
              ? unitConversions.pressure.imperialToMetric(car.rear_tire_pressure)
              : null)
          : car.rear_tire_pressure ??
            (car.rear_tire_pressure_metric
              ? unitConversions.pressure.metricToImperial(car.rear_tire_pressure_metric)
              : null),
      unitType: 'pressure',
    },
  ]

  const brakes: SpecificationItem[] = [
    {
      key: 'front_brakes',
      label: getSpecLabel('front_brakes', 'Front Brakes'),
      value: car.front_brakes,
    },
    {
      key: 'rear_brakes',
      label: getSpecLabel('rear_brakes', 'Rear Brakes'),
      value: car.rear_brakes,
    },
    {
      key: 'brake_rotors',
      label: getSpecLabel('brake_rotors', 'Rotors'),
      value: car.brake_rotors,
    },
    {
      key: 'brake_caliper_brand',
      label: getSpecLabel('brake_caliper_brand', 'Caliper Brand'),
      value: car.brake_caliper_brand,
    },
    {
      key: 'brake_lines',
      label: getSpecLabel('brake_lines', 'Brake Lines'),
      value: car.brake_lines,
    },
  ]

  const suspension: SpecificationItem[] = [
    {
      key: 'front_suspension',
      label: getSpecLabel('front_suspension', 'Front Suspension'),
      value: car.front_suspension,
    },
    {
      key: 'rear_suspension',
      label: getSpecLabel('rear_suspension', 'Rear Suspension'),
      value: car.rear_suspension,
    },
    {
      key: 'suspension_type',
      label: getSpecLabel('suspension_type', 'Suspension Type'),
      value: car.suspension_type,
    },
    {
      key: 'ride_height',
      label: getSpecLabel('ride_height', 'Ride Height'),
      value: car.ride_height,
    },
    {
      key: 'coilovers',
      label: getSpecLabel('coilovers', 'Coilovers'),
      value: car.coilovers,
    },
    {
      key: 'sway_bars',
      label: getSpecLabel('sway_bars', 'Sway Bars'),
      value: car.sway_bars,
    },
  ]

  const exterior: SpecificationItem[] = [
    {
      key: 'body_kit',
      label: getSpecLabel('body_kit', 'Body Kit'),
      value: car.body_kit,
    },
    {
      key: 'paint_color',
      label: getSpecLabel('paint_color', 'Paint Color'),
      value: car.paint_color,
    },
    {
      key: 'paint_type',
      label: getSpecLabel('paint_type', 'Paint Type'),
      value: car.paint_type,
    },
    {
      key: 'wrap_color',
      label: getSpecLabel('wrap_color', 'Wrap Color'),
      value: car.wrap_color,
    },
    {
      key: 'carbon_fiber_parts',
      label: getSpecLabel('carbon_fiber_parts', 'Carbon Fiber Parts'),
      value: car.carbon_fiber_parts,
    },
    {
      key: 'lighting',
      label: getSpecLabel('lighting', 'Lighting'),
      value: car.lighting,
    },
  ]

  const interior: SpecificationItem[] = [
    {
      key: 'interior_color',
      label: getSpecLabel('interior_color', 'Interior Color'),
      value: car.interior_color,
    },
    {
      key: 'interior_material',
      label: getSpecLabel('interior_material', 'Interior Material'),
      value: car.interior_material,
    },
    { key: 'seats', label: getSpecLabel('seats', 'Seats'), value: car.seats },
    {
      key: 'steering_wheel',
      label: getSpecLabel('steering_wheel', 'Steering Wheel'),
      value: car.steering_wheel,
    },
    {
      key: 'shift_knob',
      label: getSpecLabel('shift_knob', 'Shift Knob'),
      value: car.shift_knob,
    },
    {
      key: 'gauges',
      label: getSpecLabel('gauges', 'Gauges'),
      value: car.gauges,
    },
  ]

  const additionalDetails: SpecificationItem[] = [
    {
      key: 'mileage',
      label: getSpecLabel('mileage', 'Mileage'),
      value:
        unitPreference === 'metric'
          ? car.mileage_metric ??
            (car.mileage
              ? unitConversions.distance.imperialToMetric(car.mileage)
              : null)
          : car.mileage ??
            (car.mileage_metric
              ? unitConversions.distance.metricToImperial(car.mileage_metric)
              : null),
      unitType: 'distance',
    },
    {
      key: 'fuel_economy',
      label: getSpecLabel('fuel_economy', 'Fuel Economy'),
      value: car.fuel_economy,
    },
    { key: 'vin', label: getSpecLabel('vin', 'VIN'), value: car.vin },
    {
      key: 'maintenance_history',
      label: getSpecLabel('maintenance_history', 'Maintenance History'),
      value: car.maintenance_history,
    },
    {
      key: 'modifications',
      label: getSpecLabel('modifications', 'Modifications'),
      value:
        car.modifications && car.modifications.length > 0
          ? car.modifications.join(', ')
          : null,
    },
    {
      key: 'dyno_results',
      label: getSpecLabel('dyno_results', 'Dyno Results'),
      value: car.dyno_results,
    },
  ]

  const buildStory: SpecificationItem[] = [
    {
      key: 'build_story',
      label: getSpecLabel('build_story', 'Build Story'),
      value: car.build_story,
    },
    {
      key: 'build_start_date',
      label: getSpecLabel('build_start_date', 'Build Start Date'),
      value: car.build_start_date,
    },
    {
      key: 'total_build_cost',
      label: getSpecLabel('total_build_cost', 'Total Build Cost'),
      value: car.total_build_cost
        ? `$${car.total_build_cost.toLocaleString()}`
        : null,
    },
    {
      key: 'inspiration',
      label: getSpecLabel('inspiration', 'Inspiration'),
      value: car.inspiration,
    },
  ]

  const socialLinks: SpecificationItem[] = [
    {
      key: 'instagram_handle',
      label: getSpecLabel('instagram_handle', 'Instagram'),
      value: car.instagram_handle
        ? `@${car.instagram_handle.replace('@', '')}`
        : null,
    },
    {
      key: 'youtube_channel',
      label: getSpecLabel('youtube_channel', 'YouTube'),
      value: car.youtube_channel,
    },
    {
      key: 'build_thread_url',
      label: getSpecLabel('build_thread_url', 'Build Thread'),
      value: car.build_thread_url,
    },
    {
      key: 'website_url',
      label: getSpecLabel('website_url', 'Website'),
      value: car.website_url,
    },
  ]

  return (
    <div className={className}>
      <h2 className='text-2xl font-bold text-foreground mb-6'>
        {t('carDetail.specs.title', 'Specifications')}
      </h2>

      <div className='bg-card shadow rounded-lg divide-y divide-border'>
        <div className='p-6'>
          <SpecificationSection
            title={getSectionLabel('basicInformation', 'Basic Information')}
            specifications={basicInfo}
          />
        </div>

        {buildStory.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('buildStory', 'Build Story & Project Info')}
              specifications={buildStory}
            />
          </div>
        )}

        {engineSpecs.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('enginePerformance', 'Engine & Performance')}
              specifications={engineSpecs}
            />
          </div>
        )}

        {wheelsAndTires.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('wheelsAndTires', 'Wheels & Tires')}
              specifications={wheelsAndTires}
            />
          </div>
        )}

        {brakes.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('brakeSystem', 'Brake System')}
              specifications={brakes}
            />
          </div>
        )}

        {suspension.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('suspension', 'Suspension')}
              specifications={suspension}
            />
          </div>
        )}

        {exterior.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('exterior', 'Exterior')}
              specifications={exterior}
            />
          </div>
        )}

        {interior.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('interior', 'Interior')}
              specifications={interior}
            />
          </div>
        )}

        {additionalDetails.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('additionalDetails', 'Additional Details')}
              specifications={additionalDetails}
            />
          </div>
        )}

        {socialLinks.some(spec => spec.value) && (
          <div className='p-6'>
            <SpecificationSection
              title={getSectionLabel('socialLinks', 'Social & Links')}
              specifications={socialLinks}
            />
          </div>
        )}

        {car.build_goals && car.build_goals.length > 0 && (
          <div className='p-6'>
            <h3 className='text-lg font-medium text-foreground mb-4'>
              {t('carDetail.specs.buildGoals', 'Build Goals')}
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
