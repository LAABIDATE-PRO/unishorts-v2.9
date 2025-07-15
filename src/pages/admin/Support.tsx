import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ExternalLink, Trash2, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { showError, showSuccess } from '@/utils/toast';

const fetchTickets = async (): Promise<SupportTicket[]> => {
  const { data, error } = await supabase.rpc('get_support_tickets_with_profiles');
  if (error) throw new Error(error.message);
  return data || [];
};

const AdminSupport = () => {
  const queryClient = useQueryClient();
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['supportTickets'],
    queryFn: fetchTickets,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Ticket status updated.');
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
    onError: (error: Error) => {
      showError(`Failed to update status: ${error.message}`);
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm('Are you sure you want to delete this ticket?')) return;
      const { error } = await supabase.from('support_tickets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Ticket deleted.');
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
    onError: (error: Error) => {
      showError(`Failed to delete ticket: ${error.message}`);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="secondary">Open</Badge>;
      case 'in_progress': return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'closed': return <Badge variant="outline">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>Manage user-submitted support requests and bug reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">Loading tickets...</TableCell></TableRow>
            ) : tickets.length > 0 ? (
              tickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="font-medium">{ticket.user_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{ticket.user_email}</div>
                  </TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{format(new Date(ticket.created_at), 'PP')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert(ticket.message)}>View Message</DropdownMenuItem>
                        {ticket.screenshot_url && (
                          <DropdownMenuItem asChild>
                            <a href={ticket.screenshot_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" /> View Screenshot
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: ticket.id, status: 'in_progress' })}>
                          <Clock className="mr-2 h-4 w-4" /> Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: ticket.id, status: 'closed' })}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark as Closed
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteTicketMutation.mutate(ticket.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center h-24">No support tickets found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminSupport;