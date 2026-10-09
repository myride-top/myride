import { MinimalFooter } from '@/components/common/minimal-footer'

interface ProfileLayoutProps {
  children: React.ReactNode
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <>
      {children}
      <MinimalFooter />
    </>
  )
}
