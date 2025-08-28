import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy - MyRide',
  description: 'Cookie Policy for MyRide - Learn about our use of cookies and tracking technologies',
}

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. They help websites 
              remember information about your visit, such as your preferred language and other settings, making your 
              next visit easier and more useful.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Cookies</h2>
            <p>
              At MyRide, we use cookies and similar technologies to enhance your experience, analyze how our platform 
              is used, and provide personalized content. Cookies help us understand how you interact with our service 
              and allow us to improve it continuously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">3.1 Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable basic functions like page 
              navigation, access to secure areas, and form submissions. The website cannot function properly without these cookies.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Authentication cookies (login sessions)</li>
              <li>Security cookies (CSRF protection)</li>
              <li>Load balancing cookies</li>
              <li>User preference cookies (language, theme)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">3.2 Performance Cookies</h3>
            <p>
              These cookies collect information about how visitors use our website, such as which pages are visited 
              most often and if users get error messages. This information is used to improve how our website works.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Analytics cookies (Google Analytics)</li>
              <li>Error tracking cookies</li>
              <li>Performance monitoring cookies</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">3.3 Functionality Cookies</h3>
            <p>
              These cookies allow the website to remember choices you make and provide enhanced, more personal features. 
              They may also be used to provide services you have requested.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>User preference cookies (car display settings)</li>
              <li>Search history cookies</li>
              <li>Content personalization cookies</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">3.4 Third-Party Cookies</h3>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We use these services to 
              enhance functionality and analyze usage patterns.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Social media cookies (if you share content)</li>
              <li>Analytics service cookies</li>
              <li>Content delivery network cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Specific Cookies We Use</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Cookie Name</th>
                    <th className="border border-border px-4 py-2 text-left">Purpose</th>
                    <th className="border border-border px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2">auth_token</td>
                    <td className="border border-border px-4 py-2">User authentication and session management</td>
                    <td className="border border-border px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">theme_preference</td>
                    <td className="border border-border px-4 py-2">Stores user's theme preference (light/dark)</td>
                    <td className="border border-border px-4 py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">unit_preference</td>
                    <td className="border border-border px-4 py-2">Stores user's preferred unit system (metric/imperial)</td>
                    <td className="border border-border px-4 py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">_ga</td>
                    <td className="border border-border px-4 py-2">Google Analytics - distinguishes unique users</td>
                    <td className="border border-border px-4 py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">_gid</td>
                    <td className="border border-border px-4 py-2">Google Analytics - distinguishes unique users</td>
                    <td className="border border-border px-4 py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Managing Your Cookie Preferences</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3">5.1 Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings preferences. You can:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Delete existing cookies</li>
              <li>Block cookies from being set</li>
              <li>Set your browser to ask for permission before setting cookies</li>
              <li>Set your browser to delete cookies when you close it</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">5.2 Browser-Specific Instructions</h3>
            <p>Here's how to manage cookies in popular browsers:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">5.3 Third-Party Opt-Out</h3>
            <p>
              For third-party cookies, you can opt out through the respective service providers:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline">Google Analytics Opt-out</a></li>
              <li>Social media platform settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Impact of Disabling Cookies</h2>
            <p>
              While you can disable cookies, please note that doing so may affect the functionality of our website. 
              Some features may not work properly, and your experience may be less personalized.
            </p>
            <p className="mt-2">
              Essential cookies cannot be disabled as they are necessary for the website to function properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
              operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
              updated policy on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <p className="mt-2">
              Email: tonyasek007@gmail.com<br />
              GitHub: <a href="https://github.com/baudys" className="text-primary hover:underline">github.com/baudys</a>
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
