import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, ExternalLink } from 'lucide-react';

export const KYCRequests = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-kyc-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('kyc_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateKYCMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ kyc_status: status })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('KYC status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-requests'] });
    },
    onError: () => {
      toast.error('Failed to update KYC status');
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">KYC Verification Requests</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Phone</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Document</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Submitted</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests?.map((request) => (
              <tr key={request.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">{request.full_name || 'N/A'}</td>
                <td className="py-3 px-4">{request.phone || 'N/A'}</td>
                <td className="py-3 px-4">
                  {request.kyc_document_url ? (
                    <a
                      href={request.kyc_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      View Document
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    'No document'
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="secondary">{request.kyc_status}</Badge>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(request.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateKYCMutation.mutate({ userId: request.user_id, status: 'approved' })}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateKYCMutation.mutate({ userId: request.user_id, status: 'rejected' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
