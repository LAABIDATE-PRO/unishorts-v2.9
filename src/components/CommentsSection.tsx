import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, CornerDownRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentWithProfile } from '@/types';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from './ui/skeleton';

interface CommentsSectionProps {
  filmId: string;
}

const CommentsSection = ({ filmId }: CommentsSectionProps) => {
  const { session, profile } = useSession();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentWithProfile | null>(null);

  const fetchComments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .rpc('get_comments_with_profiles', { film_id_input: filmId });

    if (error) {
      console.error('Error fetching comments:', error);
      showError('Could not load comments.');
    } else {
      setComments(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [filmId]);

  const handlePostComment = async () => {
    if (!session || !profile || !newComment.trim()) return;
    setIsSubmitting(true);

    const { data: newCommentData, error } = await supabase.from('comments').insert({
      film_id: filmId,
      user_id: session.user.id,
      content: newComment,
      parent_comment_id: replyingTo ? replyingTo.id : null,
    }).select().single();

    if (error) {
      showError('Failed to post comment.');
      setIsSubmitting(false);
      return;
    }
    
    showSuccess('Comment posted!');
    setNewComment('');
    setReplyingTo(null);
    fetchComments(); // Refresh comments

    const commenterName = profile.username || `${profile.first_name} ${profile.last_name}`;

    if (replyingTo) {
      if (replyingTo.user_id !== session.user.id) {
        await supabase.from('notifications').insert({
          user_id: replyingTo.user_id,
          type: 'comment_reply',
          message: `${commenterName} replied to your comment.`,
          url: `/film/${filmId}`,
          related_entity_id: newCommentData.id,
        });
      }
    } else {
      const { data: filmData } = await supabase.from('films').select('user_id, title').eq('id', filmId).single();
      if (filmData && filmData.user_id !== session.user.id) {
        await supabase.from('notifications').insert({
          user_id: filmData.user_id,
          type: 'new_comment',
          message: `${commenterName} commented on your film: "${filmData.title}"`,
          url: `/film/${filmId}`,
          related_entity_id: newCommentData.id,
        });
      }
    }

    setIsSubmitting(false);
  };

  const nestedComments = useMemo(() => {
    const commentMap: Map<string, CommentWithProfile & { replies: CommentWithProfile[] }> = new Map();
    comments.forEach(comment => commentMap.set(comment.id, { ...comment, replies: [] }));
    
    const rootComments: (CommentWithProfile & { replies: CommentWithProfile[] })[] = [];
    
    commentMap.forEach(comment => {
      if (comment.parent_comment_id && commentMap.has(comment.parent_comment_id)) {
        commentMap.get(comment.parent_comment_id)!.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });
    
    return rootComments;
  }, [comments]);

  return (
    <div className="bg-card border p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-foreground mb-4">Comments ({comments.length})</h3>
      
      {session && (
        <div className="mb-6">
          {replyingTo && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md mb-2 flex justify-between items-center">
              <span>Replying to @{replyingTo.profiles?.username || 'Anonymous'}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a public comment..."
            className="mb-2"
            disabled={isSubmitting}
          />
          <Button onClick={handlePostComment} disabled={!newComment.trim() || isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <CommentSkeleton key={i} />)
        ) : nestedComments.length > 0 ? (
          nestedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={setReplyingTo} session={session} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment, onReply, session, level = 0 }: { comment: CommentWithProfile & { replies: CommentWithProfile[] }, onReply: (comment: CommentWithProfile) => void, session: any, level?: number }) => {
  const profile = comment.profiles;
  const authorName = profile?.username || 'Anonymous';
  
  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div className="flex space-x-4 rtl:space-x-reverse">
        <Avatar>
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
            <p className="font-semibold">{authorName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
          <p className="text-foreground mt-1 whitespace-pre-wrap">
            {comment.content}
          </p>
          {session && (
            <Button variant="ghost" size="sm" className="mt-1 text-xs" onClick={() => onReply(comment)}>
              <CornerDownRight className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {comment.replies.map(reply => (
          <CommentItem key={reply.id} comment={reply as any} onReply={onReply} session={session} level={level + 1} />
        ))}
      </div>
    </div>
  );
};

const CommentSkeleton = () => (
  <div className="flex space-x-4 rtl:space-x-reverse">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

export default CommentsSection;