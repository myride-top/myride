import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Licenses - MyRide',
  description: 'Licenses and intellectual property information for MyRide',
}

export default function LicensesPage() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='prose prose-gray dark:prose-invert max-w-none'>
        <h1 className='text-4xl font-bold mb-8'>Licenses</h1>

        <div className='space-y-6 text-muted-foreground'>
          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              1. MyRide Platform License
            </h2>
            <p>
              MyRide is a proprietary platform developed by Daniel Anthony
              Baudyš. All rights reserved. The platform, including its design,
              functionality, and content management system, is protected by
              copyright laws.
            </p>
            <p className='mt-2'>
              Users are granted a limited, non-exclusive, non-transferable
              license to use the platform in accordance with our Terms of
              Service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              2. Open Source Software
            </h2>
            <p>
              MyRide is built using several open source technologies and
              libraries. We are committed to respecting and complying with all
              applicable open source licenses.
            </p>

            <h3 className='text-xl font-semibold text-foreground mb-3 mt-4'>
              2.1 Core Technologies
            </h3>
            <div className='space-y-4'>
              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>Next.js</h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/vercel/next.js'
                    className='text-primary hover:underline'
                  >
                    https://github.com/vercel/next.js
                  </a>
                </p>
              </div>

              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>React</h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/facebook/react'
                    className='text-primary hover:underline'
                  >
                    https://github.com/facebook/react
                  </a>
                </p>
              </div>

              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>TypeScript</h4>
                <p className='text-sm'>Apache License 2.0</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/microsoft/TypeScript'
                    className='text-primary hover:underline'
                  >
                    https://github.com/microsoft/TypeScript
                  </a>
                </p>
              </div>

              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>Tailwind CSS</h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/tailwindlabs/tailwindcss'
                    className='text-primary hover:underline'
                  >
                    https://github.com/tailwindlabs/tailwindcss
                  </a>
                </p>
              </div>
            </div>

            <h3 className='text-xl font-semibold text-foreground mb-3 mt-6'>
              2.2 UI Components and Libraries
            </h3>
            <div className='space-y-4'>
              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>
                  Lucide React (Icons)
                </h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/lucide-react/lucide'
                    className='text-primary hover:underline'
                  >
                    https://github.com/lucide-react/lucide
                  </a>
                </p>
              </div>

              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>Framer Motion</h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/framer/motion'
                    className='text-primary hover:underline'
                  >
                    https://github.com/framer/motion
                  </a>
                </p>
              </div>

              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>Radix UI</h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/radix-ui/primitives'
                    className='text-primary hover:underline'
                  >
                    https://github.com/radix-ui/primitives
                  </a>
                </p>
              </div>

              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>
                  Sonner (Toast Notifications)
                </h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/emilkowalski/sonner'
                    className='text-primary hover:underline'
                  >
                    https://github.com/emilkowalski/sonner
                  </a>
                </p>
              </div>
            </div>

            <h3 className='text-xl font-semibold text-foreground mb-3 mt-6'>
              2.3 Development Tools
            </h3>
            <div className='space-y-4'>
              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>ESLint</h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/eslint/eslint'
                    className='text-primary hover:underline'
                  >
                    https://github.com/eslint/eslint
                  </a>
                </p>
              </div>

              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>PostCSS</h4>
                <p className='text-sm'>MIT License</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://github.com/postcss/postcss'
                    className='text-primary hover:underline'
                  >
                    https://github.com/postcss/postcss
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              3. Third-Party Services
            </h2>
            <p>
              MyRide integrates with several third-party services. Each service
              has its own terms of service and privacy policy that users should
              review.
            </p>

            <div className='space-y-4'>
              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>Supabase</h4>
                <p className='text-sm'>Database and authentication services</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://supabase.com/terms'
                    className='text-primary hover:underline'
                  >
                    Terms of Service
                  </a>{' '}
                  |
                  <a
                    href='https://supabase.com/privacy'
                    className='text-primary hover:underline ml-2'
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>

              <div className='border border-border rounded-lg p-4'>
                <h4 className='font-semibold text-foreground'>Vercel</h4>
                <p className='text-sm'>Hosting and deployment platform</p>
                <p className='text-sm mt-1'>
                  <a
                    href='https://vercel.com/legal/terms'
                    className='text-primary hover:underline'
                  >
                    Terms of Service
                  </a>{' '}
                  |
                  <a
                    href='https://vercel.com/legal/privacy'
                    className='text-primary hover:underline ml-2'
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              4. User Content Licensing
            </h2>
            <p>
              When you upload content to MyRide (such as car photos and
              information), you retain ownership of your content. However, you
              grant MyRide a worldwide, non-exclusive, royalty-free license to
              use, reproduce, modify, and distribute your content in connection
              with the Service.
            </p>
            <p className='mt-2'>
              This license allows us to display your content to other users and
              maintain the functionality of our platform.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              5. Trademarks and Branding
            </h2>
            <p>
              &quot;MyRide&quot; is a trademark of Daniel Anthony Baudyš. All
              logos, designs, and branding elements associated with MyRide are
              protected by trademark laws.
            </p>
            <p className='mt-2'>
              Users may not use MyRide trademarks, logos, or branding without
              explicit written permission.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              6. Copyright Notice
            </h2>
            <p>
              © {new Date().getFullYear()} Daniel Anthony Baudyš. All rights
              reserved.
            </p>
            <p className='mt-2'>
              The MyRide platform, including its source code, design, and
              content, is protected by copyright laws and international
              treaties. Unauthorized reproduction or distribution of this
              software, or any portion of it, may result in severe civil and
              criminal penalties.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              7. License Compliance
            </h2>
            <p>
              We are committed to complying with all open source licenses used
              in our platform. If you believe we have not properly attributed or
              complied with any license, please contact us immediately.
            </p>
            <p className='mt-2'>
              We also encourage users to respect intellectual property rights
              and not upload content that infringes on the rights of others.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              8. Contact Information
            </h2>
            <p>
              For questions about licensing, intellectual property, or to
              request permission to use MyRide trademarks, please contact us:
            </p>
            <p className='mt-2'>
              Email: tonyasek007@gmail.com
              <br />
              GitHub:{' '}
              <a
                href='https://github.com/baudys'
                className='text-primary hover:underline'
              >
                github.com/baudys
              </a>
            </p>
          </section>

          <div className='mt-8 pt-6 border-t border-border'>
            <p className='text-sm text-muted-foreground'>
              Last updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
