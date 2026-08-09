import { MinimalFooter } from '@/components/common/minimal-footer'

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <main className='flex-1'>{children}</main>
      <MinimalFooter />
    </div>
  )
}
