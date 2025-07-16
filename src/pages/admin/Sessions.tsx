import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ActiveSession = {
  id: string;
  created_at: string;
  ip_address: string | null;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  country: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

const AdminSessions = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_active_sessions_with_profiles');

    if (error) {
      showError('Failed to fetch active sessions.');
      console.error(error);
    } else {
      setSessions(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const terminateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session? The user will be logged out.')) return;
    const { error } = await supabase.from('user_sessions').delete().eq('id', sessionId);
    if (error) {
      showError('Failed to terminate session.');
    } else {
      showSuccess('Session terminated.');
      fetchSessions();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active User Sessions</CardTitle>
        <CardDescription>Monitor and manage currently active user sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Logged In</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : sessions.map(session => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="font-medium">{session.first_name} {session.last_name}</div>
                  <div className="text-sm text-muted-foreground">{session.email}</div>
                </TableCell>
                <TableCell>{session.device_type} - {session.os} - {session.browser}</TableCell>
                <TableCell>{session.country} ({session.ip_address})</TableCell>
                <TableCell>{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => terminateSession(session.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Terminate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminSessions;