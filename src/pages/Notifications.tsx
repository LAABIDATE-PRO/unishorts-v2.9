import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Notification as NotificationType, NotificationType as NotificationFilterType } from '@/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { showError, showSuccess } from '@/utils/toast';
import NotificationItem from '@/components/NotificationItem';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackButton from '@/components/BackButton';

const fetchNotifications = async (): Promise<NotificationType[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

const Notifications = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationFilterType | 'all'>('all');

  const { data: notifications = [], isLoading } = useQuery<NotificationType[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_status: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications.filter(n => !n.read_status).map(n => n.id);
      if (unreadIds.length === 0) return;
      const { error } = await supabase
        .from('notifications')
        .update({ read_status: true })
        .in('id', unreadIds);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('All notifications marked as read.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      showError(`Failed to mark all as read: ${error.message}`);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Notification deleted.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      showError(`Failed to delete notification: ${error.message}`);
    },
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') {
      return true;
    }
    if (filter === 'new_comment') {
      return n.type === 'new_comment' || n.type === 'comment_reply';
    }
    return n.type === filter;
  });

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <BackButton />
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Notifications</CardTitle>
              <Button variant="ghost" onClick={() => markAllAsReadMutation.mutate()} disabled={notifications.every(n => n.read_status)}>
                Mark all as read
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="mb-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new_comment">Comments</TabsTrigger>
                <TabsTrigger value="film_approved">Approvals</TabsTrigger>
                <TabsTrigger value="film_rejected">Rejections</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsReadMutation.mutate(notification.id)}
                    onDelete={() => deleteNotificationMutation.mutate(notification.id)}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>You have no notifications here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Notifications;