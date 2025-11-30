import { Card } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AdminOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, tradesRes, fundsRes, kycRes] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('trades').select('id', { count: 'exact', head: true }),
        supabase.from('fund_requests').select('id, status', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
      ]);

      return {
        totalUsers: usersRes.count || 0,
        totalTrades: tradesRes.count || 0,
        pendingFunds: fundsRes.count || 0,
        pendingKYC: kycRes.count || 0,
      };
    },
  });

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card className="p-6 bg-gradient-primary border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-success border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">Total Trades</p>
            <p className="text-3xl font-bold text-white">{stats?.totalTrades || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-warning border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">Pending Funds</p>
            <p className="text-3xl font-bold text-white">{stats?.pendingFunds || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-danger border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">Pending KYC</p>
            <p className="text-3xl font-bold text-white">{stats?.pendingKYC || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
        </div>
      </Card>
    </div>
  );
};
