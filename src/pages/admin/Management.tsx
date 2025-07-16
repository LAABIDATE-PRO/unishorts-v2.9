import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminFilms from "@/pages/admin/Films";
import AdminUsers from "@/pages/admin/Users";
import AdminInstitutions from "@/pages/admin/Institutions";
import AdminSessions from "@/pages/admin/Sessions";
import AdminSupport from "@/pages/admin/Support";

const AdminManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Management</h1>
        <p className="text-muted-foreground">
          Manage day-to-day operations including films, users, and institutions.
        </p>
      </div>
      <Tabs defaultValue="films" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="films">Films</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        <TabsContent value="films" className="mt-6">
          <AdminFilms />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <AdminUsers />
        </TabsContent>
        <TabsContent value="institutions" className="mt-6">
          <AdminInstitutions />
        </TabsContent>
        <TabsContent value="sessions" className="mt-6">
          <AdminSessions />
        </TabsContent>
        <TabsContent value="support" className="mt-6">
          <AdminSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminManagement;