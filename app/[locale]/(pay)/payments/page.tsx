'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { PageLayout } from '@/components/layout/page-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { EmptyState } from '@/components/common/empty-state'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/lib/i18n/provider'

interface Payment {
  sessionId: string
  paymentIntentId: string | null
  amount: number
  currency: string
  status: string
  type: string
  created: number
  refundedAmount: number
  canRefund: boolean
  refunds: Array<{
    id: string
    amount: number
    status: string
    reason: string
    created: number
  }>
}

export default function PaymentsPage() {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [refunding, setRefunding] = useState<string | null>(null)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [refundReason, setRefundReason] = useState<string>(
    'requested_by_customer'
  )
  const [refundAmount, setRefundAmount] = useState<string>('')

  const loadPayments = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/payments')
      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      setPayments(data.payments || [])
    } catch (error) {
      toast.error(t('payments.error.loadFailed', 'Failed to load payments'))
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }, [t, user])

  useEffect(() => {
    if (user) {
      void loadPayments()
    }
  }, [user, loadPayments])

  const handleRefund = async () => {
    if (!selectedPayment) return

    setRefunding(selectedPayment.sessionId)
    try {
      const body: {
        sessionId: string
        reason: string
        amount?: number
      } = {
        sessionId: selectedPayment.sessionId,
        reason: refundReason,
      }

      if (refundAmount && refundAmount.trim() !== '') {
        const amount = parseFloat(refundAmount)
        if (isNaN(amount) || amount <= 0) {
          toast.error(t('payments.error.invalidAmount', 'Invalid refund amount'))
          setRefunding(null)
          return
        }
        body.amount = Math.round(amount * 100) // Convert to cents
      }

      const response = await fetch('/api/refund-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      toast.success(
        t('payments.toast.refundSuccess', 'Refund processed successfully')
      )
      setRefundDialogOpen(false)
      setSelectedPayment(null)
      setRefundAmount('')
      setRefundReason('requested_by_customer')

      // Reload payments
      await loadPayments()
    } catch (error) {
      toast.error(
        t('payments.error.refundFailed', 'Failed to process refund')
      )
      console.error('Error processing refund:', error)
    } finally {
      setRefunding(null)
    }
  }

  const openRefundDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setRefundAmount('')
    setRefundReason('requested_by_customer')
    setRefundDialogOpen(true)
  }

  const formatAmount = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat(
      locale === 'cs'
        ? 'cs-CZ'
        : locale === 'de'
        ? 'de-DE'
        : locale === 'es'
        ? 'es-ES'
        : 'en-US',
      {
      style: 'currency',
      currency: currency.toUpperCase(),
      }
    ).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(
      locale === 'cs'
        ? 'cs-CZ'
        : locale === 'de'
        ? 'de-DE'
        : locale === 'es'
        ? 'es-ES'
        : 'en-US',
      {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      }
    )
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'premium':
        return t('payments.type.premium', 'Premium Access')
      case 'car_slot':
        return t('payments.type.carSlot', 'Car Slot')
      default:
        return type
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className='w-5 h-5 text-green-500' />
      case 'unpaid':
        return <XCircle className='w-5 h-5 text-red-500' />
      default:
        return <AlertCircle className='w-5 h-5 text-yellow-500' />
    }
  }

  const remainingAmount = selectedPayment
    ? selectedPayment.amount - selectedPayment.refundedAmount
    : 0

  return (
    <ProtectedRoute>
      <PageLayout showCreateButton maxWidth='4xl'>
        <div className='mb-8'>
            <h1 className='text-3xl font-bold text-foreground mb-2'>
              {t('payments.title', 'Payment History')}
            </h1>
            <p className='text-muted-foreground'>
              {t(
                'payments.description',
                'View and manage your payment history and refunds'
              )}
            </p>
          </div>

          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <LoadingSpinner />
            </div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title={t('payments.empty.title', 'No payments found')}
              description={t(
                'payments.empty.description',
                "You haven't made any payments yet."
              )}
            />
          ) : (
            <div className='space-y-4'>
              {payments.map(payment => (
                <div
                  key={payment.sessionId}
                  className='bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      {getStatusIcon(payment.status)}
                      <div>
                        <h3 className='font-semibold text-foreground'>
                          {getPaymentTypeLabel(payment.type)}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          {formatDate(payment.created)}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-foreground'>
                        {formatAmount(payment.amount, payment.currency)}
                      </div>
                      {payment.refundedAmount > 0 && (
                        <div className='text-sm text-muted-foreground'>
                          {t('payments.refunded', 'Refunded')}:{' '}
                          {formatAmount(
                            payment.refundedAmount,
                            payment.currency
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {payment.refunds.length > 0 && (
                    <div className='mb-4 pt-4 border-t border-border'>
                      <h4 className='text-sm font-medium text-foreground mb-2'>
                        {t('payments.refunds', 'Refunds')}:
                      </h4>
                      <div className='space-y-2'>
                        {payment.refunds.map(refund => (
                          <div
                            key={refund.id}
                            className='flex items-center justify-between text-sm bg-muted/50 rounded p-2'
                          >
                            <div>
                              <span className='text-muted-foreground'>
                                {formatAmount(refund.amount, payment.currency)}
                              </span>
                              <span className='text-muted-foreground ml-2'>
                                ({refund.reason.replace('_', ' ')})
                              </span>
                            </div>
                            <span className='text-muted-foreground'>
                              {formatDate(refund.created)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {payment.canRefund && (
                    <div className='pt-4 border-t border-border'>
                      <Button
                        onClick={() => openRefundDialog(payment)}
                        variant='outline'
                        size='sm'
                        className='w-full'
                      >
                        <RefreshCw className='w-4 h-4 mr-2' />
                        {t('payments.requestRefund', 'Request Refund')}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* Refund Dialog */}
        <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('payments.requestRefund', 'Request Refund')}
              </DialogTitle>
              <DialogDescription>
                {selectedPayment && (
                  <>
                    {t('payments.dialog.requestFor', 'Request a refund for')}{' '}
                    {formatAmount(
                      selectedPayment.amount,
                      selectedPayment.currency
                    )}{' '}
                    {t(
                      'payments.dialog.requestHelp',
                      'payment. You can request a full or partial refund.'
                    )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className='space-y-4 py-4'>
                <div className='bg-muted/50 rounded-lg p-4'>
                  <div className='flex justify-between text-sm mb-2'>
                    <span className='text-muted-foreground'>
                      {t('payments.dialog.originalAmount', 'Original Amount')}:
                    </span>
                    <span className='font-medium'>
                      {formatAmount(
                        selectedPayment.amount,
                        selectedPayment.currency
                      )}
                    </span>
                  </div>
                  {selectedPayment.refundedAmount > 0 && (
                    <div className='flex justify-between text-sm mb-2'>
                      <span className='text-muted-foreground'>
                        {t(
                          'payments.dialog.alreadyRefunded',
                          'Already Refunded'
                        )}
                        :
                      </span>
                      <span className='font-medium'>
                        {formatAmount(
                          selectedPayment.refundedAmount,
                          selectedPayment.currency
                        )}
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between text-sm pt-2 border-t border-border'>
                    <span className='text-muted-foreground'>
                      {t(
                        'payments.dialog.remainingAmount',
                        'Remaining Amount'
                      )}
                      :
                    </span>
                    <span className='font-semibold'>
                      {formatAmount(remainingAmount, selectedPayment.currency)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className='text-sm font-medium text-foreground mb-2 block'>
                    {t(
                      'payments.dialog.refundAmount',
                      'Refund Amount (leave empty for full refund)'
                    )}
                  </label>
                  <div className='relative'>
                    <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <input
                      type='number'
                      step='0.01'
                      min='0'
                      max={remainingAmount / 100}
                      value={refundAmount}
                      onChange={e => setRefundAmount(e.target.value)}
                      placeholder={`Max: ${formatAmount(
                        remainingAmount,
                        selectedPayment.currency
                      )}`}
                      className='w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                    />
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t(
                      'payments.dialog.refundAmountHelp',
                      'Leave empty to refund the full remaining amount'
                    )}
                  </p>
                </div>

                <div>
                  <label className='text-sm font-medium text-foreground mb-2 block'>
                    {t('payments.dialog.refundReason', 'Refund Reason')}
                  </label>
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='requested_by_customer'>
                        {t(
                          'payments.reason.requestedByCustomer',
                          'Requested by Customer'
                        )}
                      </SelectItem>
                      <SelectItem value='duplicate'>
                        {t(
                          'payments.reason.duplicate',
                          'Duplicate Payment'
                        )}
                      </SelectItem>
                      <SelectItem value='fraudulent'>
                        {t('payments.reason.fraudulent', 'Fraudulent')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setRefundDialogOpen(false)
                  setSelectedPayment(null)
                }}
                disabled={refunding !== null}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleRefund} disabled={refunding !== null}>
                {refunding ? (
                  <>
                    <LoadingSpinner size='sm' className='mr-2' />
                    {t('payments.processing', 'Processing...')}
                  </>
                ) : (
                  t('payments.requestRefund', 'Request Refund')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </ProtectedRoute>
  )
}
