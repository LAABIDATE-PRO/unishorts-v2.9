import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CheckCircle2, XCircle, MessageSquare, Reply, FileUp, Award, Megaphone, MoreHorizontal, Trash2, Check, UserCheck, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const notificationIcons: { [key in Notification['type']]: ReactNode } = {
  film_approved: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  film_rejected: <XCircle className="h-5 w-5 text-red-500" />,
  new_comment: <MessageSquare className="h-5 w-5 text-blue-500" />,
  comment_reply: <Reply className="h-5 w-5 text-purple-500" />,
  new_submission: <FileUp className="h-5 w-5 text-orange-500" />,
  milestone: <Award className="h-5 w-5 text-yellow-500" />,
  platform_update: <Megaphone className="h-5 w-5 text-indigo-500" />,
  account_approved: <UserCheck className="h-5 w-5 text-green-500" />,
  account_rejected: <UserX className="h-5 w-5 text-red-500" />,
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }: NotificationItemProps) => {
  const icon = notificationIcons[notification.type] || <div className="h-5 w-5" />;

  const content = (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg transition-colors",
        notification.read_status ? 'bg-transparent' : 'bg-primary/5',
        notification.url ? 'hover:bg-muted/50' : ''
      )}
      onClick={() => !notification.read_status && onMarkAsRead()}
    >
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.read_status && (
              <DropdownMenuItem onClick={onMarkAsRead}>
                <Check className="mr-2 h-4 w-4" /> Mark as read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDelete} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return notification.url ? (
    <Link to={notification.url} className="block">
      {content}
    </Link>
  ) : (
    content
  );
};

export default NotificationItem;