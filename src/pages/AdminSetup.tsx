import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminSetup = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();
        
        setRole(roleData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      setLoading(true);

      // Delete any existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      // Insert admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) throw error;

      toast.success("Admin role assigned successfully!");
      
      // Refresh status
      await checkStatus();
      
      // Redirect to admin panel after 1 second
      setTimeout(() => {
        navigate('/app/admin');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error making admin:', error);
      toast.error(error.message || "Failed to assign admin role");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
          <p className="text-muted-foreground mb-4">Please login first to setup admin access.</p>
          <Button onClick={() => navigate('/auth/login')} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Admin Setup</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">User ID</p>
            <p className="font-mono text-xs">{user.id}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Current Role</p>
            <p className="font-medium">
              {role ? (
                <span className="text-green-600">✅ {role.role}</span>
              ) : (
                <span className="text-yellow-600">⚠️ No role assigned</span>
              )}
            </p>
          </div>
        </div>

        {role?.role === 'admin' ? (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-center font-medium">
                🎉 You are already an Admin!
              </p>
            </div>
            <Button onClick={() => navigate('/app/admin')} className="w-full">
              Go to Admin Panel
            </Button>
          </div>
        ) : (
          <Button onClick={makeAdmin} disabled={loading} className="w-full">
            {loading ? 'Assigning...' : 'Make Me Admin'}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default AdminSetup;
