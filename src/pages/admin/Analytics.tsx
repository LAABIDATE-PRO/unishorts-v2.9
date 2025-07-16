import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/admin/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Eye, Users, Film, Globe, Tv, University, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

// Define interfaces for analytics data
interface AnalyticsOverview {
  total_views: number;
  unique_visitors: number;
  total_films: number;
  total_users: number;
}

interface ViewsTimeseries {
  date: string;
  views: number;
}

interface TopFilm {
  title: string;
  views: number;
  avg_watch_percentage: number;
}

interface DeviceBreakdown {
  device_type: string;
  views: number;
}

interface TopCountry {
  country: string;
  views: number;
}

interface TopInstitution {
  institution_name: string;
  views: number;
}

// Fetcher functions for each analytics component
const fetchOverview = async (): Promise<AnalyticsOverview> => {
  const { data, error } = await supabase.rpc('get_analytics_overview').single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Analytics overview data not found.');
  
  const typedData = data as AnalyticsOverview;

  return {
    total_views: typedData.total_views ?? 0,
    unique_visitors: typedData.unique_visitors ?? 0,
    total_films: typedData.total_films ?? 0,
    total_users: typedData.total_users ?? 0,
  };
};

const fetchViewsTimeseries = async (): Promise<ViewsTimeseries[]> => {
  const { data, error } = await supabase.rpc('get_views_timeseries_analytics', { days_limit: 30 });
  if (error) throw new Error(error.message);
  return data.map((d: ViewsTimeseries) => ({ ...d, date: format(new Date(d.date), 'MMM dd') }));
};

const fetchTopFilms = async (): Promise<TopFilm[]> => {
  const { data, error } = await supabase.rpc('get_top_films_analytics', { limit_count: 10 });
  if (error) throw new Error(error.message);
  return data;
};

const fetchDeviceBreakdown = async (): Promise<DeviceBreakdown[]> => {
  const { data, error } = await supabase.rpc('get_device_breakdown_analytics');
  if (error) throw new Error(error.message);
  return data;
};

const fetchTopCountries = async (): Promise<TopCountry[]> => {
  const { data, error } = await supabase.rpc('get_top_countries_analytics', { limit_count: 5 });
  if (error) throw new Error(error.message);
  return data;
};

const fetchTopInstitutions = async (): Promise<TopInstitution[]> => {
  const { data, error } = await supabase.rpc('get_top_institutions_analytics', { limit_count: 5 });
  if (error) throw new Error(error.message);
  return data;
};

const AdminAnalytics = () => {
  const { data: overview, isLoading: loadingOverview } = useQuery({ queryKey: ['analyticsOverview'], queryFn: fetchOverview });
  const { data: viewsTimeseries, isLoading: loadingTimeseries } = useQuery({ queryKey: ['analyticsTimeseries'], queryFn: fetchViewsTimeseries });
  const { data: topFilms, isLoading: loadingTopFilms } = useQuery({ queryKey: ['analyticsTopFilms'], queryFn: fetchTopFilms });
  const { data: deviceBreakdown, isLoading: loadingDevice } = useQuery({ queryKey: ['analyticsDevice'], queryFn: fetchDeviceBreakdown });
  const { data: topCountries, isLoading: loadingCountries } = useQuery({ queryKey: ['analyticsCountries'], queryFn: fetchTopCountries });
  const { data: topInstitutions, isLoading: loadingInstitutions } = useQuery({ queryKey: ['analyticsInstitutions'], queryFn: fetchTopInstitutions });

  const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">An overview of platform engagement and content performance.</p>
      </div>

      {loadingOverview ? <Skeleton className="h-28 w-full" /> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Views" value={overview?.total_views?.toLocaleString() || '0'} icon={<Eye className="h-5 w-5 text-muted-foreground" />} />
          <StatCard title="Unique Visitors" value={overview?.unique_visitors?.toLocaleString() || '0'} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
          <StatCard title="Total Films" value={overview?.total_films?.toLocaleString() || '0'} icon={<Film className="h-5 w-5 text-muted-foreground" />} />
          <StatCard title="Total Users" value={overview?.total_users?.toLocaleString() || '0'} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Views (Last 30 Days)</CardTitle></CardHeader>
        <CardContent>
          {loadingTimeseries ? <Skeleton className="h-72 w-full" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsTimeseries} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top 10 Most Watched Films</CardTitle></CardHeader>
          <CardContent>
            {loadingTopFilms ? <Skeleton className="h-72 w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topFilms} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="title" width={120} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Tv className="h-5 w-5" />Device Breakdown</CardTitle></CardHeader>
          <CardContent>
            {loadingDevice ? <Skeleton className="h-72 w-full" /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={deviceBreakdown} dataKey="views" nameKey="device_type" cx="50%" cy="50%" outerRadius={100} label>
                    {deviceBreakdown?.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Top Countries by Views</CardTitle></CardHeader>
          <CardContent>
            {loadingCountries ? <Skeleton className="h-48 w-full" /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Country</TableHead><TableHead className="text-right">Views</TableHead></TableRow></TableHeader>
                <TableBody>
                  {topCountries?.map(c => <TableRow key={c.country}><TableCell>{c.country}</TableCell><TableCell className="text-right">{c.views.toLocaleString()}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><University className="h-5 w-5" />Top Institutions by Views</CardTitle></CardHeader>
          <CardContent>
            {loadingInstitutions ? <Skeleton className="h-48 w-full" /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Institution</TableHead><TableHead className="text-right">Views</TableHead></TableRow></TableHeader>
                <TableBody>
                  {topInstitutions?.map(i => <TableRow key={i.institution_name}><TableCell>{i.institution_name}</TableCell><TableCell className="text-right">{i.views.toLocaleString()}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;