import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for MyRide - Learn how we protect your personal information and handle your data on our automotive showcase platform.',
  keywords:
    'privacy policy, data protection, personal information, car showcase platform, automotive community',
  openGraph: {
    title: 'MyRide - Privacy Policy',
    description:
      'Privacy Policy for MyRide - Learn how we protect your personal information and handle your data on our automotive showcase platform.',
    type: 'website',
    url: 'https://myride.top/legal/privacy',
    siteName: 'MyRide',
    images: [
      {
        url: '/og-image-default.svg',
        width: 1200,
        height: 630,
        alt: 'MyRide Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyRide - Privacy Policy',
    description:
      'Privacy Policy for MyRide - Learn how we protect your personal information and handle your data on our automotive showcase platform.',
    images: ['/og-image-default.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPage() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='prose prose-gray dark:prose-invert max-w-none'>
        <h1 className='text-4xl font-bold mb-8'>Privacy Policy</h1>

        <div className='space-y-6 text-muted-foreground'>
          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              1. Introduction
            </h2>
            <p>
              At MyRide, we are committed to protecting your privacy and
              ensuring the security of your personal information. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              2. Information We Collect
            </h2>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              2.1 Personal Information
            </h3>
            <p>We may collect the following personal information:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Name and username</li>
              <li>Email address</li>
              <li>Profile information and preferences</li>
              <li>Car information and photos you choose to share</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className='text-xl font-semibold text-foreground mb-3 mt-4'>
              2.2 Automatically Collected Information
            </h3>
            <p>
              We automatically collect certain information when you use our
              service:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>
                Device information (IP address, browser type, operating system)
              </li>
              <li>Usage data (pages visited, time spent, features used)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log files and analytics data</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              3. How We Use Your Information
            </h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>Providing and maintaining our services</li>
              <li>Processing your registration and managing your account</li>
              <li>Displaying your car information and photos to other users</li>
              <li>Facilitating communication between users</li>
              <li>Improving our platform and user experience</li>
              <li>Sending important service updates and notifications</li>
              <li>Preventing fraud and ensuring platform security</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              4. Information Sharing and Disclosure
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information in the following
              circumstances:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>
                <strong>Public Content:</strong> Car information and photos you
                choose to share are visible to other users
              </li>
              <li>
                <strong>Service Providers:</strong> With trusted third-party
                services that help us operate our platform
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights and safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
              <li>
                <strong>Consent:</strong> When you explicitly give us permission
                to share your information
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              5. Data Storage and Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. Your data is stored
              securely using industry-standard encryption and security
              practices.
            </p>
            <p className='mt-2'>
              However, no method of transmission over the internet or electronic
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              6. Cookies and Tracking Technologies
            </h2>
            <p>
              We use cookies and similar tracking technologies to enhance your
              experience, analyze usage patterns, and provide personalized
              content. You can control cookie settings through your browser
              preferences.
            </p>
            <p className='mt-2'>
              For more detailed information about our use of cookies, please see
              our Cookie Policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              7. Your Rights and Choices
            </h2>
            <p>
              You have the following rights regarding your personal information:
            </p>
            <ul className='list-disc pl-6 mt-2 space-y-1'>
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your data to
                another service
              </li>
              <li>
                <strong>Objection:</strong> Object to certain processing of your
                information
              </li>
              <li>
                <strong>Withdrawal:</strong> Withdraw consent for data
                processing
              </li>
            </ul>
            <p className='mt-2'>
              To exercise these rights, please contact us using the information
              provided below.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              8. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to
              provide our services and fulfill the purposes outlined in this
              policy. When you delete your account, we will delete or anonymize
              your personal information, except where retention is required by
              law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our service is not intended for children under the age of 13. We
              do not knowingly collect personal information from children under
              13. If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              10. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your own. We ensure that such transfers comply with
              applicable data protection laws and implement appropriate
              safeguards to protect your information.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              our platform and updating the &quot;Last Updated&quot; date. Your
              continued use of our service after such changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-foreground mb-4'>
              12. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
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
