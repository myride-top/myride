'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LegalModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')

  return (
    <>
      {/* Legal Links */}
      <div className='text-xs text-muted-foreground mt-3 text-center'>
        View our{' '}
        <button
          onClick={() => {
            setActiveTab('privacy')
            setIsOpen(true)
          }}
          className='text-primary hover:underline cursor-pointer'
        >
          Privacy Policy
        </button>{' '}
        and{' '}
        <button
          onClick={() => {
            setActiveTab('terms')
            setIsOpen(true)
          }}
          className='text-primary hover:underline cursor-pointer'
        >
          Terms of Service
        </button>
        .
      </div>

      {/* Modal */}
      {isOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-border'>
              <div className='flex space-x-4'>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'privacy'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === 'terms'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Terms of Service
                </button>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='text-muted-foreground hover:text-foreground'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Content */}
            <div className='p-6 overflow-y-auto max-h-[60vh]'>
              {activeTab === 'privacy' ? (
                <div className='space-y-4 text-sm text-muted-foreground'>
                  <h3 className='text-lg font-semibold text-foreground mb-4'>
                    Privacy Policy
                  </h3>

                  <section>
                    <h4 className='font-semibold text-foreground mb-2'>
                      Data Protection
                    </h4>
                    <p>
                      We implement appropriate security measures to protect your
                      personal information. Your email address is stored
                      securely and will only be used for the purposes stated
                      above.
                    </p>
                  </section>

                  <section>
                    <h4 className='font-semibold text-foreground mb-2'>
                      Contact Us
                    </h4>
                    <p>
                      If you have any questions about our privacy practices,
                      please contact us at{' '}
                      <a
                        href='mailto:support@myride.top'
                        className='text-primary hover:underline'
                      >
                        support@myride.top
                      </a>
                    </p>
                  </section>
                </div>
              ) : (
                <div className='space-y-4 text-sm text-muted-foreground'>
                  <h3 className='text-lg font-semibold text-foreground mb-4'>
                    Terms of Service
                  </h3>

                  <section>
                    <h4 className='font-semibold text-foreground mb-2'>
                      Service Description
                    </h4>
                    <p>
                      MyRide is a platform that allows car enthusiasts to
                      showcase their vehicles, share photos, connect with other
                      automotive enthusiasts, and browse car collections from
                      around the world.
                    </p>
                  </section>

                  <section>
                    <h4 className='font-semibold text-foreground mb-2'>
                      Contact Us
                    </h4>
                    <p>
                      If you have any questions about these terms, please
                      contact us at{' '}
                      <a
                        href='mailto:support@myride.top'
                        className='text-primary hover:underline'
                      >
                        support@myride.top
                      </a>
                    </p>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='p-6 border-t border-border flex justify-end'>
              <Button
                onClick={() => setIsOpen(false)}
                className='cursor-pointer'
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
