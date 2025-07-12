import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
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
    }).select().single();

    if (error) {
      showError('Failed to post comment.');
      setIsSubmitting(false);
      return;
    }
    
    showSuccess('Comment posted!');
    setNewComment('');
    fetchComments(); // Refresh comments

    // Create notification
    const { data: filmData } = await supabase.from('films').select('user_id, title').eq('id', filmId).single();
    if (filmData && filmData.user_id !== session.user.id) {
      const commenterName = profile.username || `${profile.first_name} ${profile.last_name}`;
      await supabase.from('notifications').insert({
        user_id: filmData.user_id,
        type: 'new_comment',
        message: `${commenterName} commented on your film: "${filmData.title}"`,
        url: `/film/${filmId}`,
        related_entity_id: newCommentData.id,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comments ({comments.length})</h3>
      
      {session && (
        <div className="mb-6">
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
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment }: { comment: CommentWithProfile }) => {
  const profile = comment.profiles;
  const authorName = profile?.username || 'Anonymous';
  
  return (
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
        <p className="text-gray-800 dark:text-gray-300 mt-1">
          {comment.content}
        </p>
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