import { redirect } from 'next/navigation'

export default function HomePage() {
  // This page should never be reached due to middleware redirects
  // But as a fallback, redirect to browse
  redirect('/browse')
}
