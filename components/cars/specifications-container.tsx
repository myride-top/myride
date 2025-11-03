import { cn } from '@/lib/utils'
import { SpecificationSection as SpecSection } from '@/lib/data/car-specifications'
import { SpecificationSection } from './specification-section'
import { useState } from 'react'

interface SpecificationsContainerProps {
  sections: SpecSection[]
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showDividers?: boolean
  showBackground?: boolean
  showShadow?: boolean
  title?: string
  titleClassName?: string
  emptyMessage?: string
}

export const SpecificationsContainer = ({
  sections,
  className = '',
  variant = 'default',
  showDividers = true,
  showBackground = true,
  showShadow = true,
  title = 'Specifications',
  titleClassName = '',
  emptyMessage = 'No specifications available',
}: SpecificationsContainerProps) => {
  const variantClasses = {
    default: {
      container: 'bg-card shadow rounded-lg',
      section: 'p-6',
      title: 'text-2xl font-bold text-foreground mb-6',
    },
    compact: {
      container: 'bg-card shadow-sm rounded-lg',
      section: 'p-4',
      title: 'text-xl font-semibold text-foreground mb-4',
    },
    minimal: {
      container: 'bg-transparent',
      section: 'p-3',
      title: 'text-lg font-medium text-foreground mb-3',
    },
  }

  const currentVariant = variantClasses[variant]

  // Filter out sections that should not be displayed
  const visibleSections = sections.filter(section =>
    section.specifications.some(
      spec =>
        spec.value !== null && spec.value !== undefined && spec.value !== ''
    )
  )

  if (visibleSections.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className='text-muted-foreground'>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Title */}
      {title && (
        <h2 className={cn(currentVariant.title, titleClassName)}>{title}</h2>
      )}

      {/* Specifications Container */}
      <div
        className={cn(
          currentVariant.container,
          showBackground && 'bg-card',
          showShadow && 'shadow rounded-lg',
          showDividers && 'divide-y divide-border'
        )}
      >
        {visibleSections.map(section => (
          <div key={section.id} className={currentVariant.section}>
            <SpecificationSection
              title={section.title}
              specifications={section.specifications}
              variant={variant}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Extended component with build goals section
interface SpecificationsWithBuildGoalsProps
  extends Omit<SpecificationsContainerProps, 'sections'> {
  sections: SpecSection[]
  buildGoals?: string[]
  showBuildGoals?: boolean
  buildGoalsTitle?: string
}

export function SpecificationsWithBuildGoals({
  sections,
  buildGoals = [],
  showBuildGoals = true,
  buildGoalsTitle = 'Build Goals',
  ...props
}: SpecificationsWithBuildGoalsProps) {
  return (
    <div className='space-y-6'>
      <SpecificationsContainer sections={sections} {...props} />

      {/* Build Goals Section */}
      {showBuildGoals && buildGoals.length > 0 && (
        <div
          className={cn(
            'bg-card shadow rounded-lg p-6',
            props.showDividers && 'border-t border-border pt-6'
          )}
        >
          <h3 className='text-lg font-medium text-foreground mb-4'>
            {buildGoalsTitle}
          </h3>
          <ul className='space-y-2'>
            {buildGoals.map((goal, index) => (
              <li
                key={index}
                className='text-sm text-foreground flex items-start'
              >
                <span className='text-primary mr-2 mt-1'>•</span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Compact specifications display for cards or sidebars
interface CompactSpecificationsProps {
  sections: SpecSection[]
  maxSections?: number
  maxSpecsPerSection?: number
  className?: string
  showSectionTitles?: boolean
}

export function CompactSpecifications({
  sections,
  maxSections = 3,
  maxSpecsPerSection = 3,
  className = '',
  showSectionTitles = false,
}: CompactSpecificationsProps) {
  const visibleSections = sections
    .filter(section =>
      section.specifications.some(
        spec =>
          spec.value !== null && spec.value !== undefined && spec.value !== ''
      )
    )
    .slice(0, maxSections)

  if (visibleSections.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {visibleSections.map(section => {
        const visibleSpecs = section.specifications
          .filter(
            spec =>
              spec.value !== null &&
              spec.value !== undefined &&
              spec.value !== ''
          )
          .slice(0, maxSpecsPerSection)

        if (visibleSpecs.length === 0) return null

        return (
          <div key={section.id} className='space-y-2'>
            {showSectionTitles && (
              <h4 className='text-sm font-medium text-foreground'>
                {section.title}
              </h4>
            )}
            <div className='grid grid-cols-1 gap-1'>
              {visibleSpecs.map(spec => (
                <div key={spec.key} className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>{spec.label}:</span>
                  <span className='text-foreground font-medium'>
                    {spec.value}
                    {spec.unit && (
                      <span className='text-muted-foreground ml-1'>
                        {spec.unit}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Tabbed specifications for better organization
interface TabbedSpecificationsProps
  extends Omit<SpecificationsContainerProps, 'sections'> {
  sections: SpecSection[]
  defaultTab?: string
  className?: string
}

export function TabbedSpecifications({
  sections,
  defaultTab,
  className = '',
  ...props
}: TabbedSpecificationsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultTab || sections[0]?.id || ''
  )
  const visibleSections = sections.filter(section =>
    section.specifications.some(
      spec =>
        spec.value !== null && spec.value !== undefined && spec.value !== ''
    )
  )

  if (visibleSections.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className='text-muted-foreground'>No specifications available</p>
      </div>
    )
  }

  const activeSection =
    visibleSections.find(section => section.id === activeTab) ||
    visibleSections[0]

  return (
    <div className={className}>
      {/* Title */}
      {props.title && (
        <h2
          className={cn(
            'text-2xl font-bold text-foreground mb-6',
            props.titleClassName
          )}
        >
          {props.title}
        </h2>
      )}

      {/* Tabs */}
      <div className='border-b border-border mb-6'>
        <nav className='flex space-x-8'>
          {visibleSections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === section.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Section Content */}
      <div className='bg-card shadow rounded-lg p-6'>
        <SpecificationSection
          title={activeSection.title}
          specifications={activeSection.specifications}
          variant={props.variant}
        />
      </div>
    </div>
  )
}
