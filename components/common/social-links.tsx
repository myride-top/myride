import SocialMediaIcon, { SocialPlatform } from '../icons/social-media-icon'

export interface SocialLink {
  platform: SocialPlatform
  url: string
  label?: string
}

interface SocialLinksProps {
  links: SocialLink[]
  className?: string
  iconClassName?: string
  size?: number
  showLabels?: boolean
}

export const SocialLinks = ({
  links,
  className = '',
  iconClassName = '',
  size = 24,
  showLabels = false,
}: SocialLinksProps) => {
  return (
    <div className={`flex justify-center space-x-6 ${className}`}>
      {links.map(link => (
        <a
          key={link.platform}
          href={link.url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-muted-foreground hover:text-primary transition-colors duration-200 group'
          title={link.label || `Visit our ${link.platform} page`}
        >
          <div className='flex items-center gap-2'>
            <SocialMediaIcon
              platform={link.platform}
              className={`${iconClassName} group-hover:scale-110 transition-transform duration-200`}
              size={size}
            />
            {showLabels && link.label && (
              <span className='text-sm font-medium'>{link.label}</span>
            )}
          </div>
        </a>
      ))}
    </div>
  )
}
