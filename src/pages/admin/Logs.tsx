import React, { useState, useMemo } from 'react';
import { useQuery, QueryFunctionContext, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { Badge } from '@/components/ui/badge';

const fetchLogs = async ({ queryKey }: QueryFunctionContext): Promise<SystemLog[]> => {
  const [_key, searchTerm, eventType] = queryKey;
  let query = supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (searchTerm) {
    query = query.or(`user_email.ilike.%${searchTerm}%,details->>message.ilike.%${searchTerm}%`);
  }
  if (eventType !== 'all' && typeof eventType === 'string') {
    query = query.eq('action', eventType);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
};

const AdminLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: allLogs = [] } = useQuery<SystemLog[]>({
    queryKey: ['systemLogs', '', 'all'],
    queryFn: fetchLogs,
  });

  const { data: logs, isLoading } = useQuery<SystemLog[]>({
    queryKey: ['systemLogs', debouncedSearchTerm, eventType],
    queryFn: fetchLogs,
    placeholderData: keepPreviousData,
  });

  const eventTypes = useMemo(() => {
    const uniqueTypes = new Set(allLogs.map(log => log.action));
    return ['all', ...Array.from(uniqueTypes).sort()];
  }, [allLogs]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Event Logs</CardTitle>
        <CardDescription>A record of recent major events that have occurred on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Input 
            placeholder="Search by email or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Filter by event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(type => <SelectItem key={type} value={type}>{type === 'all' ? 'All Event Types' : type}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !logs ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))
            ) : (logs && logs.length > 0) ? (
              logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.created_at), 'PPpp')}</TableCell>
                  <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                  <TableCell>{log.user_email || 'System'}</TableCell>
                  <TableCell className="text-sm">{log.details?.message || JSON.stringify(log.details)}</TableCell>
                  <TableCell className="font-mono">{log.ip_address || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">No logs found for the current filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminLogs;