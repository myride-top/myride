import React from 'react'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  render?: (value: unknown, item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: DataTableColumn<T>[]
  className?: string
  variant?: 'default' | 'compact' | 'minimal' | 'bordered'
  showHeader?: boolean
  showBorders?: boolean
  hoverEffect?: boolean
  emptyMessage?: string
  loading?: boolean
  onRowClick?: (item: T, index: number) => void
  rowClassName?: (item: T, index: number) => string
  headerClassName?: string
  bodyClassName?: string
}

export default function DataTable<T = Record<string, unknown>>({
  data,
  columns,
  className = '',
  variant = 'default',
  showHeader = true,
  hoverEffect = true,
  emptyMessage = 'No data available',
  loading = false,
  onRowClick,
  rowClassName,
  headerClassName = '',
  bodyClassName = '',
}: DataTableProps<T>) {
  const variantClasses = {
    default: {
      table: 'w-full',
      header: 'bg-muted/50',
      row: 'border-b border-border last:border-b-0',
      cell: 'px-4 py-3',
      headerCell:
        'px-4 py-3 font-medium text-left text-sm text-muted-foreground',
    },
    compact: {
      table: 'w-full',
      header: 'bg-muted/30',
      row: 'border-b border-border/50 last:border-b-0',
      cell: 'px-3 py-2',
      headerCell:
        'px-3 py-2 font-medium text-left text-xs text-muted-foreground',
    },
    minimal: {
      table: 'w-full',
      header: 'bg-transparent',
      row: 'border-b border-border/30 last:border-b-0',
      cell: 'px-2 py-1',
      headerCell:
        'px-2 py-1 font-medium text-left text-xs text-muted-foreground',
    },
    bordered: {
      table: 'w-full border border-border rounded-lg overflow-hidden',
      header: 'bg-muted/50 border-b border-border',
      row: 'border-b border-border last:border-b-0',
      cell: 'px-4 py-3 border-r border-border last:border-r-0',
      headerCell:
        'px-4 py-3 font-medium text-left text-sm text-muted-foreground border-r border-border last:border-r-0',
    },
  }

  const currentVariant = variantClasses[variant]

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className='text-muted-foreground'>Loading...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className='text-muted-foreground'>{emptyMessage}</p>
      </div>
    )
  }

  const getCellAlignment = (column: DataTableColumn<T>) => {
    switch (column.align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  const renderCell = (column: DataTableColumn<T>, item: T, index: number) => {
    if (column.render) {
      return column.render(item[column.key as keyof T], item, index)
    }

    const value = item[column.key as keyof T]
    if (value === null || value === undefined) {
      return <span className='text-muted-foreground'>—</span>
    }

    return String(value)
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className={currentVariant.table}>
        {showHeader && (
          <thead className={cn(currentVariant.header, headerClassName)}>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    currentVariant.headerCell,
                    getCellAlignment(column),
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className={bodyClassName}>
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item, index)}
              className={cn(
                currentVariant.row,
                hoverEffect && 'hover:bg-muted/30 transition-colors',
                onRowClick && 'cursor-pointer',
                rowClassName?.(item, index)
              )}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={cn(
                    currentVariant.cell,
                    getCellAlignment(column),
                    column.className
                  )}
                >
                  {renderCell(column, item, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Specialized data table for specifications
interface SpecificationsTableProps {
  specifications: Array<{
    key: string
    label: string
    value: string | number | null
    unit?: string
  }>
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showUnits?: boolean
  emptyMessage?: string
}

export function SpecificationsTable({
  specifications,
  className = '',
  variant = 'default',
  showUnits = true,
  emptyMessage = 'No specifications available',
}: SpecificationsTableProps) {
  const columns = [
    {
      key: 'label',
      label: 'Specification',
      width: '40%',
    },
    {
      key: 'value',
      label: 'Value',
      width: '60%',
      render: (value: unknown, item: { unit?: string }, index: number) => {
        if (value === null || value === undefined || value === '') {
          return <span className='text-muted-foreground'>—</span>
        }
        return (
          <span className='text-foreground'>
            {value as string | number}
            {showUnits && item.unit && (
              <span className='text-muted-foreground ml-1'>{item.unit}</span>
            )}
          </span>
        )
      },
    },
  ]

  return (
    <DataTable
      data={specifications}
      columns={columns}
      className={className}
      variant={variant}
      showBorders={false}
      hoverEffect={false}
      emptyMessage={emptyMessage}
    />
  )
}

// Key-value pairs table
interface KeyValueTableProps {
  data: Record<string, string | number | boolean | null>
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  keyLabel?: string
  valueLabel?: string
  emptyMessage?: string
}

export function KeyValueTable({
  data,
  className = '',
  variant = 'default',
  keyLabel = 'Property',
  valueLabel = 'Value',
  emptyMessage = 'No data available',
}: KeyValueTableProps) {
  const tableData = Object.entries(data).map(([key, value]) => ({
    key,
    value,
  }))

  const columns = [
    {
      key: 'key',
      label: keyLabel,
      width: '40%',
      render: (value: unknown) => (
        <span className='font-medium text-foreground'>{value as string}</span>
      ),
    },
    {
      key: 'value',
      label: valueLabel,
      width: '60%',
      render: (value: unknown) => {
        if (value === null || value === undefined || value === '') {
          return <span className='text-muted-foreground'>—</span>
        }
        if (typeof value === 'boolean') {
          return (
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                value
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}
            >
              {value ? 'Yes' : 'No'}
            </span>
          )
        }
        if (Array.isArray(value)) {
          return (
            <div className='flex flex-wrap gap-1'>
              {value.map((item, index) => (
                <span
                  key={index}
                  className='inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground'
                >
                  {item}
                </span>
              ))}
            </div>
          )
        }
        return <span className='text-foreground'>{String(value)}</span>
      },
    },
  ]

  return (
    <DataTable
      data={tableData}
      columns={columns}
      className={className}
      variant={variant}
      showBorders={false}
      hoverEffect={false}
      emptyMessage={emptyMessage}
    />
  )
}

// Compact stats table
interface StatsTableProps {
  stats: Array<{
    label: string
    value: string | number
    unit?: string
    trend?: 'up' | 'down' | 'neutral'
    change?: number
  }>
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
}

export function StatsTable({
  stats,
  className = '',
  variant = 'default',
}: StatsTableProps) {
  const columns = [
    {
      key: 'label',
      label: 'Metric',
      width: '50%',
    },
    {
      key: 'value',
      label: 'Value',
      width: '50%',
      render: (
        value: unknown,
        item: {
          label: string
          value: string | number
          unit?: string
          trend?: 'up' | 'down' | 'neutral'
          change?: number
        }
      ) => (
        <div className='flex items-center justify-between'>
          <span className='text-foreground font-medium'>
            {value as string | number}
            {item.unit && (
              <span className='text-muted-foreground ml-1'>{item.unit}</span>
            )}
          </span>
          {item.trend && item.change && (
            <span
              className={cn(
                'inline-flex items-center text-xs',
                item.trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {item.trend === 'up' ? '↗' : '↘'} {item.change}%
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={stats}
      columns={columns}
      className={className}
      variant={variant}
      showBorders={false}
      hoverEffect={false}
    />
  )
}
