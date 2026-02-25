'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'

interface DeleteEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventTitle: string
  onConfirm: () => void
  loading?: boolean
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  eventTitle,
  onConfirm,
  loading = false,
}: DeleteEventDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='w-5 h-5 text-destructive' />
            {t('map.delete.title', 'Delete Event')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'map.delete.description',
              `Are you sure you want to delete "${eventTitle}"? This action cannot be undone and will remove all attendance records for this event.`
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant='destructive' onClick={onConfirm} disabled={loading}>
            {loading
              ? t('map.delete.deleting', 'Deleting...')
              : t('map.delete.action', 'Delete Event')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
