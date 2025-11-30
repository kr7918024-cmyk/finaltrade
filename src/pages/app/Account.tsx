import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/FileUpload";
import { User, Edit2, Save, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const Account = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    nominee_name: "",
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    profile_image_url: "",
  });

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) throw error;
      
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        nominee_name: data.nominee_name || "",
        account_holder_name: data.account_holder_name || "",
        account_number: data.account_number || "",
        ifsc_code: data.ifsc_code || "",
        upi_id: data.upi_id || "",
        profile_image_url: data.profile_image_url || "",
      });
      
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!session?.user?.id) throw new Error("No user session");
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        phone: userProfile.phone || "",
        nominee_name: userProfile.nominee_name || "",
        account_holder_name: userProfile.account_holder_name || "",
        account_number: userProfile.account_number || "",
        ifsc_code: userProfile.ifsc_code || "",
        upi_id: userProfile.upi_id || "",
        profile_image_url: userProfile.profile_image_url || "",
      });
    }
    setIsEditing(false);
  };

  const getKycStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600" data-testid="badge-kyc-approved">
            KYC Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600" data-testid="badge-kyc-rejected">
            KYC Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600" data-testid="badge-kyc-pending">
            KYC Pending
          </Badge>
        );
    }
  };

  const maskAadhaar = (aadhaar: string | null | undefined) => {
    if (!aadhaar) return "Not provided";
    return `XXXX XXXX ${aadhaar.slice(-4)}`;
  };

  const maskAccountNumber = (accountNumber: string | null | undefined) => {
    if (!accountNumber) return "Not provided";
    return `XXXX XXXX ${accountNumber.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="text-muted-foreground">Manage your profile and KYC details</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-1">
            <div className="flex flex-col items-center text-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Card>
          <Card className="p-6 md:col-span-2">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const userEmail = session?.user?.email || "Not provided";
  const userName = formData.full_name || userProfile?.full_name || "User";
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="text-muted-foreground">Manage your profile and KYC details</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSave} 
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              data-testid="button-cancel-edit"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4">
            {isEditing ? (
              <div className="w-full">
                <FileUpload
                  label="Profile Image"
                  accept="image/*"
                  currentFile={formData.profile_image_url}
                  bucket="profiles"
                  onUploadComplete={(url) => setFormData({ ...formData, profile_image_url: url })}
                  maxSizeMB={2}
                />
              </div>
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={userProfile?.profile_image_url || undefined} 
                  alt={userName}
                  data-testid="img-profile-avatar"
                />
                <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="w-full">
              <h3 className="font-semibold text-lg" data-testid="text-user-name">{userName}</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-user-email">{userEmail}</p>
            </div>
            {getKycStatusBadge(userProfile?.kyc_status)}
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Full Name</Label>
              {isEditing ? (
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                  data-testid="input-full-name"
                />
              ) : (
                <p className="font-medium" data-testid="text-full-name">{userProfile?.full_name || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Mobile</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter mobile number"
                  data-testid="input-phone"
                />
              ) : (
                <p className="font-medium" data-testid="text-phone">{userProfile?.phone || "Not provided"}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <p className="font-medium text-muted-foreground" data-testid="text-email">{userEmail} (cannot be changed)</p>
            </div>
            <div className="space-y-1">
              <Label>Father's Name</Label>
              <p className="font-medium" data-testid="text-father-name">{userProfile?.father_name || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <Label>Mother's Name</Label>
              <p className="font-medium" data-testid="text-mother-name">{userProfile?.mother_name || "Not provided"}</p>
            </div>
            <div className="space-y-1">
              <Label>Nominee</Label>
              {isEditing ? (
                <Input
                  value={formData.nominee_name}
                  onChange={(e) => setFormData({ ...formData, nominee_name: e.target.value })}
                  placeholder="Enter nominee name"
                  data-testid="input-nominee"
                />
              ) : (
                <p className="font-medium" data-testid="text-nominee-name">{userProfile?.nominee_name || "Not provided"}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Document Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Aadhaar Number</Label>
            <p className="font-medium" data-testid="text-aadhaar">{maskAadhaar(userProfile?.aadhaar)}</p>
          </div>
          <div className="space-y-1">
            <Label>PAN Number</Label>
            <p className="font-medium" data-testid="text-pan">{userProfile?.pan || "Not provided"}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Document details cannot be changed by users. Contact admin for updates.</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Account Holder</Label>
            {isEditing ? (
              <Input
                value={formData.account_holder_name}
                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                placeholder="Enter account holder name"
                data-testid="input-account-holder"
              />
            ) : (
              <p className="font-medium" data-testid="text-account-holder">{userProfile?.account_holder_name || "Not provided"}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Account Number</Label>
            {isEditing ? (
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="Enter account number"
                data-testid="input-account-number"
              />
            ) : (
              <p className="font-medium" data-testid="text-account-number">{maskAccountNumber(userProfile?.account_number)}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>IFSC Code</Label>
            {isEditing ? (
              <Input
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                placeholder="Enter IFSC code"
                data-testid="input-ifsc-code"
              />
            ) : (
              <p className="font-medium" data-testid="text-ifsc-code">{userProfile?.ifsc_code || "Not provided"}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>UPI ID</Label>
            {isEditing ? (
              <Input
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                placeholder="Enter UPI ID"
                data-testid="input-upi-id"
              />
            ) : (
              <p className="font-medium" data-testid="text-upi-id">{userProfile?.upi_id || "Not provided"}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Account;
