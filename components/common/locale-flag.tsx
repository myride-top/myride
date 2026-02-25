import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n/config'

interface LocaleFlagProps {
  locale: Locale
  className?: string
  title?: string
}

export const LocaleFlag = ({ locale, className, title }: LocaleFlagProps) => {
  const svgProps = {
    viewBox: '0 0 24 16',
    className: cn(
      'block h-3.5 w-5 rounded-[2px] border border-border/40',
      className
    ),
    role: title ? 'img' : 'presentation',
    'aria-hidden': title ? undefined : true,
  } as const

  const titleElement = title ? <title>{title}</title> : null

  switch (locale) {
    case 'en':
      return (
        <svg {...svgProps}>
          {titleElement}
          <rect width='24' height='16' fill='#b22234' />
          <rect y='2' width='24' height='2' fill='#ffffff' />
          <rect y='6' width='24' height='2' fill='#ffffff' />
          <rect y='10' width='24' height='2' fill='#ffffff' />
          <rect y='14' width='24' height='2' fill='#ffffff' />
          <rect width='10.5' height='8.5' fill='#3c3b6e' />
          <circle cx='2.2' cy='2.1' r='0.45' fill='#ffffff' />
          <circle cx='4.4' cy='2.1' r='0.45' fill='#ffffff' />
          <circle cx='6.6' cy='2.1' r='0.45' fill='#ffffff' />
          <circle cx='8.8' cy='2.1' r='0.45' fill='#ffffff' />
          <circle cx='3.3' cy='4.2' r='0.45' fill='#ffffff' />
          <circle cx='5.5' cy='4.2' r='0.45' fill='#ffffff' />
          <circle cx='7.7' cy='4.2' r='0.45' fill='#ffffff' />
          <circle cx='2.2' cy='6.3' r='0.45' fill='#ffffff' />
          <circle cx='4.4' cy='6.3' r='0.45' fill='#ffffff' />
          <circle cx='6.6' cy='6.3' r='0.45' fill='#ffffff' />
          <circle cx='8.8' cy='6.3' r='0.45' fill='#ffffff' />
        </svg>
      )
    case 'cs':
      return (
        <svg {...svgProps}>
          {titleElement}
          <rect width='24' height='8' fill='#ffffff' />
          <rect y='8' width='24' height='8' fill='#d7141a' />
          <polygon points='0,0 10,8 0,16' fill='#11457e' />
        </svg>
      )
    case 'es':
      return (
        <svg {...svgProps}>
          {titleElement}
          <rect width='24' height='16' fill='#aa151b' />
          <rect y='4' width='24' height='8' fill='#f1bf00' />
        </svg>
      )
    case 'de':
      return (
        <svg {...svgProps}>
          {titleElement}
          <rect width='24' height='5.34' fill='#000000' />
          <rect y='5.33' width='24' height='5.34' fill='#dd0000' />
          <rect y='10.66' width='24' height='5.34' fill='#ffce00' />
        </svg>
      )
    default:
      return null
  }
}
