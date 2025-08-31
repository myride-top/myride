'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import {
  addCarCommentClient,
  getCarCommentsClient,
} from '@/lib/database/cars-client'
import { CarComment } from '@/lib/types/database'
import { MessageCircle, Send, User } from 'lucide-react'
import { toast } from 'sonner'

interface CarCommentsProps {
  carId: string
  carOwnerId: string
}

interface CommentWithProfile extends CarComment {
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export default function CarComments({ carId, carOwnerId }: CarCommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [carId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const commentsData = await getCarCommentsClient(carId)
      if (commentsData) {
        setComments(commentsData as CommentWithProfile[])
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      const comment = await addCarCommentClient(
        carId,
        user.id,
        newComment.trim()
      )
      if (comment) {
        setNewComment('')
        await loadComments() // Refresh comments
        toast.success('Comment added successfully!')
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='bg-card rounded-lg border border-border p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <MessageCircle className='w-5 h-5 text-muted-foreground' />
          <h3 className='text-lg font-semibold'>Comments</h3>
        </div>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
          <p className='text-muted-foreground mt-2'>Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-card rounded-lg border border-border p-6'>
      <div className='flex items-center gap-2 mb-4'>
        <MessageCircle className='w-5 h-5 text-muted-foreground' />
        <h3 className='text-lg font-semibold'>Comments ({comments.length})</h3>
      </div>

      {/* Add Comment Form */}
      {user ? (
        user.id === carOwnerId ? (
          <div className='mb-6 p-4 bg-muted/50 rounded-lg border border-border'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <MessageCircle className='w-4 h-4' />
              <p className='text-sm'>
                You cannot comment on your own car to maintain authentic engagement metrics.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitComment} className='mb-6'>
            <div className='flex gap-3'>
              <div className='flex-1'>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder='Add a comment...'
                  className='w-full px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
                  rows={3}
                  maxLength={500}
                />
              </div>
              <button
                type='submit'
                disabled={!newComment.trim() || submitting}
                className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {submitting ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto'></div>
                ) : (
                  <Send className='w-4 h-4' />
                )}
              </button>
            </div>
          </form>
        )
      ) : (
        <div className='mb-6 p-4 bg-muted/50 rounded-lg border border-border'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <MessageCircle className='w-4 h-4' />
            <p className='text-sm'>
              Please sign in to leave a comment.
            </p>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className='text-center py-8 text-muted-foreground'>
          <MessageCircle className='w-12 h-12 mx-auto mb-3 opacity-50' />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {comments.map(comment => (
            <div
              key={comment.id}
              className='flex gap-3 p-3 bg-muted/30 rounded-lg'
            >
              <div className='flex-shrink-0'>
                {comment.profiles.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.username}
                    className='w-8 h-8 rounded-full object-cover'
                  />
                ) : (
                  <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
                    <User className='w-4 h-4 text-primary-foreground' />
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='font-medium text-sm'>
                    {comment.profiles.full_name || comment.profiles.username}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className='text-sm text-foreground'>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
