import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

export const FundRequests = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-fund-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_requests')
        .select(`
          *,
          user_profiles(full_name, phone)
        `)
        .eq('request_type', 'deposit')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('fund_requests')
        .update({
          status,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, update user balance
      if (status === 'approved') {
        const request = requests?.find(r => r.id === requestId);
        if (request) {
          const { error: balanceError } = await supabase.rpc('increment_balance', {
            user_id: request.user_id,
            amount: request.amount,
          });
          if (balanceError) throw balanceError;
        }
      }
    },
    onSuccess: () => {
      toast.success('Request updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-fund-requests'] });
    },
    onError: () => {
      toast.error('Failed to update request');
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Fund Requests (Deposits)</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Phone</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Method</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Reference</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests?.map((request) => (
              <tr key={request.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">{request.user_profiles?.full_name || 'Unknown'}</td>
                <td className="py-3 px-4">{request.user_profiles?.phone || 'N/A'}</td>
                <td className="text-right py-3 px-4 font-semibold">₹{Number(request.amount).toLocaleString()}</td>
                <td className="py-3 px-4">{request.payment_method || 'N/A'}</td>
                <td className="py-3 px-4">{request.transaction_reference || 'N/A'}</td>
                <td className="py-3 px-4">
                  <Badge
                    variant={
                      request.status === 'approved'
                        ? 'default'
                        : request.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {request.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(request.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateRequestMutation.mutate({ requestId: request.id, status: 'approved' })}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateRequestMutation.mutate({ requestId: request.id, status: 'rejected' })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
