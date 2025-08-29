import Footer from '@/components/landing/footer'
import { LegalNavbar } from '@/components/navbar'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Navbar */}
      <LegalNavbar />

      {/* Main Content */}
      <main className='flex-1 pt-16'>{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
