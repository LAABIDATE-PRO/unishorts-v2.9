import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Film, Eye, Clock, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { showError } from '@/utils/toast';
import StatCard from '@/components/admin/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  users: number;
  totalFilms: number;
  published: number;
  inReview: number;
  rejected: number;
  totalViews: number;
  recentFilms: { title: string; view_count: number }[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: users } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
        const { data: films, error: filmsError } = await supabase.from('films').select('status,view_count,title').order('created_at', { ascending: false });
        if (filmsError) throw filmsError;

        const totalFilms = films.length;
        const published = films.filter(f => f.status === 'published').length;
        const inReview = films.filter(f => f.status === 'in_review').length;
        const rejected = films.filter(f => f.status === 'rejected').length;
        const totalViews = films.reduce((acc, f) => acc + (f.view_count || 0), 0);
        const recentFilms = films.slice(0, 7).map(f => ({ title: f.title.substring(0, 15) + (f.title.length > 15 ? '...' : ''), view_count: f.view_count || 0 }));

        setStats({
          users: users || 0,
          totalFilms,
          published,
          inReview,
          rejected,
          totalViews,
          recentFilms,
        });
      } catch (error: any) {
        showError('Failed to load dashboard statistics.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold"><Skeleton className="h-8 w-48" /></h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-5">
          <Skeleton className="md:col-span-3 h-80 rounded-lg" />
          <Skeleton className="md:col-span-2 h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  const filmStatusData = [
    { name: 'Published', value: stats.published },
    { name: 'In Review', value: stats.inReview },
    { name: 'Rejected', value: stats.rejected },
  ];

  const COLORS = ['hsl(var(--secondary))', 'hsl(var(--primary))', 'hsl(var(--destructive))'];

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Views" value={stats.totalViews.toLocaleString()} icon={<Eye className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Total Users" value={stats.users.toLocaleString()} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Total Films" value={stats.totalFilms.toLocaleString()} icon={<Film className="h-5 w-5 text-muted-foreground" />} />
        <StatCard title="Films In Review" value={stats.inReview.toLocaleString()} icon={<Clock className="h-5 w-5 text-muted-foreground" />} />
      </div>
      <div className="grid gap-6 mt-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Film Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.recentFilms} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="title" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="view_count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Film Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={filmStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--card))"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {filmStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;