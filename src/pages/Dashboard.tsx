import React from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MyFilms from '@/components/dashboard/MyFilms';
import Drafts from '@/components/dashboard/Drafts';
import Analytics from '@/components/dashboard/Analytics';
import { Film, FileText, BarChart2 } from 'lucide-react';
import BackButton from '@/components/BackButton';

const Dashboard = () => {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <Tabs defaultValue="my-films" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-films">
              <Film className="mr-2 h-4 w-4" />
              My Films
            </TabsTrigger>
            <TabsTrigger value="drafts">
              <FileText className="mr-2 h-4 w-4" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-films">
            <MyFilms />
          </TabsContent>
          <TabsContent value="drafts">
            <Drafts />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;