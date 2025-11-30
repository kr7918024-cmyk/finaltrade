import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDownToLine } from "lucide-react";
import { AddMoneyDialog } from "@/components/AddMoneyDialog";
import { WithdrawMoneyDialog } from "@/components/WithdrawMoneyDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const Funds = () => {
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Get user profile with balance
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get fund requests history
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['fund-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('fund_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const isLoading = profileLoading || transactionsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funds</h1>
          <p className="text-muted-foreground">Manage your trading balance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setShowAddMoney(true)}
            data-testid="button-add-money"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowWithdraw(true)}
            data-testid="button-withdraw"
          >
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </div>

      <AddMoneyDialog open={showAddMoney} onOpenChange={setShowAddMoney} />
      <WithdrawMoneyDialog 
        open={showWithdraw} 
        onOpenChange={setShowWithdraw}
        currentBalance={profile?.current_balance || 0}
      />

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
          {isLoading ? (
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold" data-testid="text-current-balance">
              ₹{(profile?.current_balance || 0).toLocaleString()}
            </p>
          )}
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Deposited</p>
          {isLoading ? (
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-success" data-testid="text-total-deposited">
              ₹{(profile?.total_deposited || 0).toLocaleString()}
            </p>
          )}
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Withdrawn</p>
          {isLoading ? (
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-destructive" data-testid="text-total-withdrawn">
              ₹{(profile?.total_withdrawn || 0).toLocaleString()}
            </p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Request History</h2>
        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
              ))}
            </>
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                data-testid={`transaction-${tx.id}`}
              >
                <div>
                  <p className="font-semibold capitalize">
                    {tx.request_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(tx.created_at!), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      tx.request_type === "withdrawal" ? "text-destructive" : "text-success"
                    }`}
                    data-testid={`amount-${tx.id}`}
                  >
                    {tx.request_type === "withdrawal" ? "-" : "+"}₹{tx.amount.toLocaleString()}
                  </p>
                  <p 
                    className={`text-sm ${
                      tx.status === 'approved' ? 'text-success' :
                      tx.status === 'rejected' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}
                    data-testid={`status-${tx.id}`}
                  >
                    {tx.status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
              <p className="text-sm">Start by adding funds to your account</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Funds;