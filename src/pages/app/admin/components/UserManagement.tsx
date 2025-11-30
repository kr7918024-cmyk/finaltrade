import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserDetailDialog } from './UserDetailDialog';
import { Eye } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

export const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'user' }) => {
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: role,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to update user role');
    },
  });

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Balance</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">KYC Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id} className="border-b border-border hover-elevate">
                  <td className="py-3 px-4" data-testid={`text-user-name-${user.id}`}>
                    {user.full_name || 'N/A'}
                  </td>
                  <td className="py-3 px-4">{user.phone || 'N/A'}</td>
                  <td className="py-3 px-4">₹{user.current_balance?.toLocaleString() || 0}</td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={user.kyc_status === 'approved' ? 'default' : 'secondary'}
                      data-testid={`badge-kyc-${user.id}`}
                    >
                      {user.kyc_status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      value={(user.user_roles as any)?.[0]?.role || 'user'}
                      onValueChange={(value: 'admin' | 'moderator' | 'user') => updateRoleMutation.mutate({ userId: user.user_id, role: value })}
                    >
                      <SelectTrigger className="w-32" data-testid={`select-role-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(user)}
                      data-testid={`button-view-user-${user.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUser && (
        <UserDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          user={selectedUser}
        />
      )}
    </>
  );
};
