import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react';
import { UserManagement } from './components/UserManagement';
import { TradesManagement } from './components/TradesManagement';
import { FundRequests } from './components/FundRequests';
import { WithdrawalRequests } from './components/WithdrawalRequests';
import { KYCRequests } from './components/KYCRequests';
import { AdminOverview } from './components/AdminOverview';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdminCheck();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, trades, and requests</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="funds">Fund Requests</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverview />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="trades">
          <TradesManagement />
        </TabsContent>

        <TabsContent value="funds">
          <FundRequests />
        </TabsContent>

        <TabsContent value="withdrawals">
          <WithdrawalRequests />
        </TabsContent>

        <TabsContent value="kyc">
          <KYCRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
