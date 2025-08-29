import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - MyRide',
  description:
    'Terms of Service for MyRide - The ultimate platform for car enthusiasts. Read our terms and conditions for using the automotive showcase platform.',
  keywords:
    'terms of service, terms and conditions, legal, car showcase platform, automotive community',
  openGraph: {
    title: 'Terms of Service - MyRide',
    description:
      'Terms of Service for MyRide - The ultimate platform for car enthusiasts. Read our terms and conditions for using the automotive showcase platform.',
    type: 'website',
    url: 'https://myride.top/legal/terms',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'MyRide Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - MyRide',
    description:
      'Terms of Service for MyRide - The ultimate platform for car enthusiasts. Read our terms and conditions for using the automotive showcase platform.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsPage() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='prose prose-gray dark:prose-invert max-w-none'>
        <h1 className='text-4xl font-bold mb-8'>Terms of Service</h1>

        <div className='space-y-6 text-muted-foreground'>
          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using MyRide (&quot;the Service&quot;), you
              accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              2. Description of Service
            </h2>
            <p>
              MyRide is a platform that allows car enthusiasts to showcase their
              vehicles, share photos, connect with other automotive enthusiasts,
              and browse car collections from around the world.
            </p>
            <p className='mt-2'>
              We also offer a waitlist service where users can sign up to be
              notified when our platform launches. By joining the waitlist, you
              agree to receive email notifications about our launch and related
              updates.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              3. User Accounts
            </h2>
            <p>
              To access certain features of the Service, you must create an
              account. You are responsible for:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>
                Maintaining the confidentiality of your account credentials
              </li>
              <li>All activities that occur under your account</li>
              <li>
                Ensuring your account information is accurate and up-to-date
              </li>
              <li>
                Notifying us immediately of any unauthorized use of your account
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              4. User Content
            </h2>
            <p>
              You retain ownership of content you submit to the Service. By
              submitting content, you grant MyRide a worldwide, non-exclusive,
              royalty-free license to use, reproduce, modify, and distribute
              your content in connection with the Service.
            </p>
            <p className='mt-2'>
              You are responsible for ensuring that your content:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Does not violate any applicable laws or regulations</li>
              <li>Does not infringe on the rights of others</li>
              <li>Is not offensive, harmful, or inappropriate</li>
              <li>Does not contain malware or other harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              5. Prohibited Activities
            </h2>
            <p>You agree not to:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Use the Service for any illegal purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>
                Attempt to gain unauthorized access to the Service or other
                users&apos; accounts
              </li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service</li>
              <li>Share inappropriate or offensive content</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              6. Car Information Accuracy
            </h2>
            <p>
              While we encourage accurate information, MyRide does not verify
              the accuracy of car specifications, photos, or other details
              posted by users. Users are responsible for the accuracy of their
              own content.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              7. Privacy
            </h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy,
              which also governs your use of the Service, to understand our
              practices.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              8. Termination
            </h2>
            <p>
              We may terminate or suspend your account and access to the Service
              at any time, with or without cause, with or without notice. You
              may also terminate your account at any time.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              9. Disclaimers
            </h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF
              ANY KIND. MYRIDE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              10. Limitation of Liability
            </h2>
            <p>
              IN NO EVENT SHALL MYRIDE BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
              LIMITED TO LOSS OF PROFITS, DATA, OR USE, INCURRED BY YOU OR ANY
              THIRD PARTY.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              11. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes by posting the new terms on
              the Service. Your continued use of the Service after such changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              12. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <p className='mt-2'>
              Email: support@myride.top
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

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              13. Governing Law
            </h2>
            <p>
              These terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which MyRide operates, without
              regard to its conflict of law provisions.
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
