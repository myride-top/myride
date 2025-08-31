'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import {
  addCarCommentClient,
  getCarCommentsClient,
  deleteCarCommentClient,
  deleteCarCommentAsOwnerClient,
  pinCarCommentClient,
  unpinCarCommentClient,
  likeCommentClient,
  unlikeCommentClient,
  hasUserLikedCommentClient,
  getCommentLikeCountClient,
} from '@/lib/database/cars-client'
import { CarComment } from '@/lib/types/database'
import {
  MessageCircle,
  Send,
  User,
  Reply,
  Trash2,
  Pin,
  PinOff,
  Heart,
} from 'lucide-react'
import { toast } from 'sonner'
import { Profile } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

interface CommentWithProfile extends CarComment {
  profiles: Profile | null
  replies?: CommentWithProfile[]
  like_count?: number
  is_liked_by_user?: boolean
}

interface CarCommentsProps {
  carId: string
  carOwnerId: string
  ownerProfile?: Profile | null
}

export default function CarComments({
  carId,
  carOwnerId,
  ownerProfile,
}: CarCommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [deletingComment, setDeletingComment] = useState<string | null>(null)
  const [pinningComment, setPinningComment] = useState<string | null>(null)
  const [likingComment, setLikingComment] = useState<string | null>(null)
  const [databaseError, setDatabaseError] = useState<string | null>(null)
  const [databaseAvailable, setDatabaseAvailable] = useState(false)
  const databaseTestedRef = useRef(false)

  useEffect(() => {
    loadComments()
  }, [carId])

  useEffect(() => {
    // Test database connection once when component mounts
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    if (databaseTestedRef.current) {
      return databaseAvailable
    }
    try {
      // Try to get a simple count from comment_likes table
      // Use a more realistic approach - just check if the table is accessible
      const supabase = createClient()
      const { data, error } = await supabase
        .from('comment_likes')
        .select('id')
        .limit(1)

      if (error) {
        console.warn('Comment likes table test failed:', error)
        if (error.code === '42P01') {
          setDatabaseError(
            'Comment likes table not found. Please run the database migration.'
          )
        } else {
          setDatabaseError(`Database error: ${error.message}`)
        }
        setDatabaseAvailable(false)
        return false
      }

      console.log('Database connection test successful')
      setDatabaseError(null)
      setDatabaseAvailable(true)
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      setDatabaseError(
        'Comment likes table not found. Please run the database migration.'
      )
      setDatabaseAvailable(false)
      return false
    } finally {
      databaseTestedRef.current = true
    }
  }

  const loadComments = async () => {
    setLoading(true)
    try {
      const commentsData = await getCarCommentsClient(carId)

      if (commentsData) {
        // Log each comment to see what we're getting
        commentsData.forEach((comment, index) => {
          const commentWithProfile = comment as CommentWithProfile
        })

        // Instead of filtering out comments with null profiles, we'll handle them gracefully
        const validComments = (commentsData as CommentWithProfile[]).map(
          comment => {
            // If profile is null, create a fallback profile object
            if (!comment.profiles) {
              // If this is the car owner's comment, use ownerProfile data
              if (comment.user_id === carOwnerId && ownerProfile) {
                return {
                  ...comment,
                  profiles: {
                    id: comment.user_id,
                    username: ownerProfile.username,
                    full_name: ownerProfile.full_name,
                    avatar_url: ownerProfile.avatar_url,
                  },
                }
              }
              // For other users, use generic fallback
              return {
                ...comment,
                profiles: {
                  id: comment.user_id,
                  username: 'Unknown User',
                  full_name: null,
                  avatar_url: null,
                },
              }
            }
            return comment
          }
        )

        // Group comments by parent (top-level vs replies)
        const topLevelComments = validComments.filter(
          comment => !comment.parent_comment_id
        ) as CommentWithProfile[]
        const replies = validComments.filter(
          comment => comment.parent_comment_id
        ) as CommentWithProfile[]

        // Attach replies to their parent comments
        topLevelComments.forEach(comment => {
          comment.replies = replies.filter(
            reply => reply.parent_comment_id === comment.id
          )

          // Process nested replies (replies to replies)
          comment.replies.forEach(reply => {
            reply.replies = replies.filter(
              nestedReply => nestedReply.parent_comment_id === reply.id
            )
          })
        })

        // Sort comments: pinned first, then by creation date
        topLevelComments.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1
          if (!a.is_pinned && b.is_pinned) return 1
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        })

        // Fetch like counts and like status for all comments
        if (user) {
          await Promise.all(
            topLevelComments.map(async comment => {
              // Get like count for main comment
              const likeCount = await getCommentLikeCountClient(comment.id)
              const isLiked = await hasUserLikedCommentClient(
                comment.id,
                user.id
              )

              comment.like_count = likeCount
              comment.is_liked_by_user = isLiked

              // Get like counts and status for replies
              if (comment.replies) {
                await Promise.all(
                  comment.replies.map(async reply => {
                    const replyLikeCount = await getCommentLikeCountClient(
                      reply.id
                    )
                    const replyIsLiked = await hasUserLikedCommentClient(
                      reply.id,
                      user.id
                    )

                    reply.like_count = replyLikeCount
                    reply.is_liked_by_user = replyIsLiked
                  })
                )
              }
            })
          )
        } else {
          // For non-authenticated users, just get like counts
          await Promise.all(
            topLevelComments.map(async comment => {
              const likeCount = await getCommentLikeCountClient(comment.id)

              comment.like_count = likeCount
              comment.is_liked_by_user = false

              if (comment.replies) {
                await Promise.all(
                  comment.replies.map(async reply => {
                    const replyLikeCount = await getCommentLikeCountClient(
                      reply.id
                    )

                    reply.like_count = replyLikeCount
                    reply.is_liked_by_user = false
                  })
                )
              }
            })
          )
        }

        setComments(topLevelComments)
      } else {
        setComments([]) // Set empty array on error
      }
    } catch (error) {
      toast.error('Failed to load comments')
      setComments([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    // Check if user is car owner and already has a top-level comment
    if (user.id === carOwnerId) {
      const existingTopLevelComment = comments.find(
        comment => comment.user_id === user.id
      )
      if (existingTopLevelComment) {
        toast.error(
          'Car owners can only create one top-level comment. You can reply to others instead.'
        )
        return
      }
    }

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
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (
    e: React.FormEvent,
    parentCommentId: string
  ) => {
    e.preventDefault()
    if (!user || !replyContent.trim()) return

    setSubmitting(true)
    try {
      // Check if we're replying to a reply (depth > 0)
      const isReplyingToReply = comments.some(comment =>
        comment.replies?.some(reply => reply.id === parentCommentId)
      )

      let actualParentId = parentCommentId
      if (isReplyingToReply) {
        // If replying to a reply, find the main comment to use as parent
        const mainComment = findMainComment(parentCommentId)
        if (mainComment) {
          actualParentId = mainComment.id
        }
      }

      const comment = await addCarCommentClient(
        carId,
        user.id,
        replyContent.trim(),
        actualParentId
      )
      if (comment) {
        setReplyContent('')
        setReplyingTo(null)

        // Add a small delay to ensure database has processed the new reply
        setTimeout(async () => {
          await loadComments() // Refresh comments
        }, 500)

        toast.success('Reply added successfully!')
      } else {
        toast.error('Failed to add reply')
      }
    } catch (error) {
      toast.error('Failed to add reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (
    commentId: string,
    commentUserId: string
  ) => {
    if (!user) return

    setDeletingComment(commentId)
    try {
      let success = false

      if (user.id === commentUserId) {
        // User deleting their own comment
        success = await deleteCarCommentClient(commentId, user.id)
      } else if (user.id === carOwnerId) {
        // Car owner deleting any comment
        success = await deleteCarCommentAsOwnerClient(commentId, carId, user.id)
      }

      if (success) {
        await loadComments() // Refresh comments
        toast.success('Comment deleted successfully!')
      } else {
        toast.error('Failed to delete comment')
      }
    } catch (error) {
      toast.error('Failed to delete comment')
    } finally {
      setDeletingComment(null)
    }
  }

  const handlePinComment = async (commentId: string) => {
    if (!user || user.id !== carOwnerId) return

    setPinningComment(commentId)
    try {
      const success = await pinCarCommentClient(commentId, carId, user.id)

      if (success) {
        // Update local state immediately for better UX
        setComments(prevComments =>
          prevComments.map(comment => ({
            ...comment,
            is_pinned: comment.id === commentId,
          }))
        )

        // Refresh from database to ensure consistency
        setTimeout(async () => {
          await loadComments()
        }, 100)

        toast.success('Comment pinned successfully!')
      } else {
        toast.error('Failed to pin comment')
      }
    } catch (error) {
      toast.error('Failed to pin comment')
    } finally {
      setPinningComment(null)
    }
  }

  const handleUnpinComment = async () => {
    if (!user || user.id !== carOwnerId) return

    setPinningComment('unpin')
    try {
      const success = await unpinCarCommentClient(carId, user.id)

      if (success) {
        // Refresh comments immediately to get the updated state
        await loadComments()
        toast.success('Comment unpinned successfully!')
      } else {
        toast.error('Failed to unpin comment')
      }
    } catch (error) {
      toast.error('Failed to unpin comment')
    } finally {
      setPinningComment(null)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!user) return

    setLikingComment(commentId)
    try {
      const success = await likeCommentClient(commentId, user.id)

      if (success) {
        console.log(
          'Like successful, updating local state for comment:',
          commentId
        )

        // Update local state immediately for better UX
        setComments(prevComments => {
          const newComments = prevComments.map(comment => {
            // Check if this is the main comment being liked
            if (comment.id === commentId) {
              const newLikeCount = (comment.like_count || 0) + 1
              console.log(
                `Updating main comment ${commentId}: ${
                  comment.like_count || 0
                } -> ${newLikeCount}`
              )
              return {
                ...comment,
                like_count: newLikeCount,
                is_liked_by_user: true,
              }
            }
            // Check if any reply within this comment is being liked
            if (comment.replies) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === commentId) {
                  const newLikeCount = (reply.like_count || 0) + 1
                  console.log(
                    `Updating reply ${commentId}: ${
                      reply.like_count || 0
                    } -> ${newLikeCount}`
                  )
                  return {
                    ...reply,
                    like_count: newLikeCount,
                    is_liked_by_user: true,
                  }
                }
                return reply
              })
              return {
                ...comment,
                replies: updatedReplies,
              }
            }
            return comment
          })

          console.log('New comments state:', newComments)
          return newComments
        })

        toast.success('Comment liked!')
      } else {
        toast.error('Failed to like comment')
      }
    } catch (error) {
      toast.error('Failed to like comment')
    } finally {
      setLikingComment(null)
    }
  }

  const handleUnlikeComment = async (commentId: string) => {
    if (!user) return

    setLikingComment(commentId)
    try {
      const success = await unlikeCommentClient(commentId, user.id)

      if (success) {
        console.log(
          'Unlike successful, updating local state for comment:',
          commentId
        )

        // Update local state immediately for better UX
        setComments(prevComments => {
          const newComments = prevComments.map(comment => {
            // Check if this is the main comment being unliked
            if (comment.id === commentId) {
              const newLikeCount = Math.max(0, (comment.like_count || 0) - 1)
              console.log(
                `Updating main comment ${commentId}: ${
                  comment.like_count || 0
                } -> ${newLikeCount}`
              )
              return {
                ...comment,
                like_count: newLikeCount,
                is_liked_by_user: false,
              }
            }
            // Check if any reply within this comment is being unliked
            if (comment.replies) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === commentId) {
                  const newLikeCount = Math.max(0, (reply.like_count || 0) - 1)
                  console.log(
                    `Updating reply ${commentId}: ${
                      reply.like_count || 0
                    } -> ${newLikeCount}`
                  )
                  return {
                    ...reply,
                    like_count: newLikeCount,
                    is_liked_by_user: false,
                  }
                }
                return reply
              })
              return {
                ...comment,
                replies: updatedReplies,
              }
            }
            return comment
          })

          console.log('New comments state after unlike:', newComments)
          return newComments
        })

        toast.success('Comment unliked')
      } else {
        toast.error('Failed to unlike comment')
      }
    } catch (error) {
      toast.error('Failed to unlike comment')
    } finally {
      setLikingComment(null)
    }
  }

  const handleLikeButtonClick = (
    commentId: string,
    isCurrentlyLiked: boolean
  ) => {
    if (!user) return

    if (isCurrentlyLiked) {
      handleUnlikeComment(commentId)
    } else {
      handleLikeComment(commentId)
    }
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const canCreateTopLevelComment = () => {
    if (!user) return false
    if (user.id !== carOwnerId) return true
    // Car owner can only create one top-level comment
    return !comments.some(comment => comment.user_id === user.id)
  }

  const canDeleteComment = (commentUserId: string) => {
    if (!user) return false
    return user.id === commentUserId || user.id === carOwnerId
  }

  const canPinComment = () => {
    return user?.id === carOwnerId
  }

  const getTotalCommentCount = () => {
    let total = comments.length // Count main comments
    comments.forEach(comment => {
      if (comment.replies) {
        total += comment.replies.length // Add replies count
      }
    })
    return total
  }

  const getTotalLikeCount = () => {
    let totalLikes = 0
    comments.forEach(comment => {
      totalLikes += comment.like_count || 0
      if (comment.replies) {
        comment.replies.forEach(reply => {
          totalLikes += reply.like_count || 0
        })
      }
    })
    return totalLikes
  }

  const findMainComment = (replyId: string): CommentWithProfile | null => {
    for (const comment of comments) {
      if (comment.replies) {
        const found = comment.replies.find(reply => reply.id === replyId)
        if (found) {
          return comment // Return the main comment that contains this reply
        }
      }
    }
    return null
  }

  const renderComment = (
    comment: CommentWithProfile,
    isReply = false,
    depth = 0
  ) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-6' : ''} ${
        depth > 0 ? 'border-l-2 border-muted pl-4' : ''
      }`}
    >
      <div
        className={`p-3 rounded-lg ${
          comment.is_pinned
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800'
            : 'bg-muted/30'
        }`}
      >
        {/* Pinned Badge */}
        {comment.is_pinned && (
          <div className='flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400'>
            <Pin className='w-4 h-4' />
            <span className='text-xs font-medium'>PINNED COMMENT</span>
          </div>
        )}

        <div className='flex gap-3'>
          <div className='flex-shrink-0'>
            {comment.profiles?.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles?.username || 'User'}
                className='w-8 h-8 rounded-full object-cover'
              />
            ) : (
              <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center'>
                <User className='w-4 h-4 text-primary-foreground' />
              </div>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-sm'>
                  {comment.profiles?.full_name ||
                    comment.profiles?.username ||
                    'Unknown User'}
                </span>
                {comment.user_id === carOwnerId && (
                  <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'>
                    Owner
                  </span>
                )}
                <span className='text-xs text-muted-foreground'>
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Owner Controls */}
              <div className='flex items-center gap-1'>
                {/* Pin Controls - Car owners can pin any comment */}
                {(() => {
                  const shouldShowPin = canPinComment() && !isReply

                  if (shouldShowPin) {
                    if (comment.is_pinned) {
                      return (
                        <button
                          onClick={() => handleUnpinComment()}
                          disabled={pinningComment === 'unpin'}
                          className='p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50 cursor-pointer'
                          title='Unpin comment'
                        >
                          {pinningComment === 'unpin' ? (
                            <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current'></div>
                          ) : (
                            <PinOff className='w-3 h-3' />
                          )}
                        </button>
                      )
                    } else {
                      return (
                        <button
                          onClick={() => {
                            handlePinComment(comment.id)
                          }}
                          disabled={pinningComment === comment.id}
                          title='Pin comment'
                          data-comment-id={comment.id}
                          data-testid={`pin-button-${comment.id}`}
                          className='p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50 cursor-pointer'
                        >
                          {pinningComment === comment.id ? (
                            <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current'></div>
                          ) : (
                            <Pin className='w-3 h-3' />
                          )}
                        </button>
                      )
                    }
                  } else {
                    return null
                  }
                })()}

                {/* Delete Controls - Only for comments user can delete */}
                {(() => {
                  const canDelete = canDeleteComment(comment.user_id)

                  return (
                    canDelete && (
                      <button
                        onClick={() =>
                          handleDeleteComment(comment.id, comment.user_id)
                        }
                        disabled={deletingComment === comment.id}
                        title='Delete comment'
                        className='p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer'
                      >
                        {deletingComment === comment.id ? (
                          <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current'></div>
                        ) : (
                          <Trash2 className='w-3 h-3' />
                        )}
                      </button>
                    )
                  )
                })()}
              </div>
            </div>

            <p className='text-sm text-foreground mb-2'>{comment.content}</p>

            <div className='flex gap-4 items-center'>
              {/* Like button */}
              <div className='flex items-center gap-2'>
                {user && (
                  <button
                    onClick={() =>
                      handleLikeButtonClick(
                        comment.id,
                        comment.is_liked_by_user || false
                      )
                    }
                    disabled={likingComment === comment.id}
                    className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer'
                    title={
                      comment.is_liked_by_user
                        ? 'Unlike comment'
                        : 'Like comment'
                    }
                  >
                    {likingComment === comment.id ? (
                      <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-current'></div>
                    ) : (
                      <Heart
                        className={`w-3 h-3 ${
                          comment.is_liked_by_user
                            ? 'fill-red-500 text-red-500'
                            : ''
                        }`}
                      />
                    )}
                    <span
                      className={comment.is_liked_by_user ? 'text-red-500' : ''}
                    >
                      {comment.like_count || 0}
                    </span>
                  </button>
                )}
                {!user && (
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Heart className='w-3 h-3' />
                    <span>{comment.like_count || 0}</span>
                  </div>
                )}
              </div>

              {/* Reply button - Show for main comments and replies, but replies create mentions instead of nesting */}
              {user && (
                <button
                  onClick={() => {
                    if (depth === 0) {
                      // For main comments, show normal reply form
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    } else {
                      // For replies, show reply form under this reply with mention pre-filled
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                      setReplyContent(
                        `@${comment.profiles?.username || 'Unknown'} `
                      )
                    }
                  }}
                  className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                >
                  <Reply className='w-3 h-3' />
                  Reply
                </button>
              )}
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <form
                onSubmit={e => handleSubmitReply(e, comment.id)}
                className='mt-3'
              >
                <div className='flex flex-col gap-2'>
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder='Write a reply...'
                    className='flex-1 px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm'
                    rows={2}
                    maxLength={500}
                  />
                  <div className='place-self-end'>
                    <button
                      type='submit'
                      disabled={!replyContent.trim() || submitting}
                      className='px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm cursor-pointer'
                    >
                      {submitting ? (
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto'></div>
                      ) : (
                        <Send className='w-4 h-4' />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Replies - Only show for main comments (depth 0) */}
      {comment.replies && comment.replies.length > 0 && depth === 0 && (
        <div className='mt-3'>
          {comment.replies.map(reply => renderComment(reply, true, depth + 1))}
        </div>
      )}
    </div>
  )

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
        <h3 className='text-lg font-semibold'>
          Comments ({getTotalCommentCount()})
        </h3>
        <span className='text-sm text-muted-foreground'>
          • {getTotalLikeCount()} likes
        </span>
      </div>

      {/* Database Error Display */}
      {databaseError && (
        <div className='mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-yellow-500 rounded-full'></div>
            <p className='text-sm text-yellow-800 dark:text-yellow-200'>
              {databaseError}
            </p>
          </div>
          <div className='mt-2 text-xs text-yellow-700 dark:text-yellow-300'>
            To enable comment likes, run the SQL migration in your Supabase
            dashboard:
            <br />
            <code className='bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded mt-1 inline-block'>
              migrations/create_comment_likes_table.sql
            </code>
          </div>
        </div>
      )}

      {/* Add Comment Form */}
      {user && canCreateTopLevelComment() && (
        <form onSubmit={handleSubmitComment} className='mb-6'>
          <div className='flex flex-col gap-2'>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={'Add a comment...'}
              className='w-full px-3 py-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
              rows={3}
              maxLength={500}
            />
            <div className='flex justify-between gap-2'>
              {user.id === carOwnerId ? (
                <p className='text-xs text-muted-foreground text-right'>
                  💡 This will be your only top-level comment. You can reply to
                  others below.
                </p>
              ) : (
                <div />
              )}
              <button
                type='submit'
                disabled={!newComment.trim() || submitting}
                className='px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm cursor-pointer'
              >
                {submitting ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto'></div>
                ) : (
                  <Send className='w-4 h-4' />
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        user?.id === carOwnerId ? null : (
          <div className='text-center py-8 text-muted-foreground'>
            <MessageCircle className='w-12 h-12 mx-auto mb-3 opacity-50' />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )
      ) : (
        <div className='space-y-4'>
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  )
}
