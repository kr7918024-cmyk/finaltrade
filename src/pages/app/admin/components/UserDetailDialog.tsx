import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Save, X } from "lucide-react";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export const UserDetailDialog = ({ open, onOpenChange, user }: UserDetailDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    father_name: user?.father_name || "",
    mother_name: user?.mother_name || "",
    nominee_name: user?.nominee_name || "",
    aadhaar: user?.aadhaar || "",
    pan: user?.pan || "",
    account_holder_name: user?.account_holder_name || "",
    account_number: user?.account_number || "",
    ifsc_code: user?.ifsc_code || "",
    upi_id: user?.upi_id || "",
    kyc_status: user?.kyc_status || "pending",
    profile_image_url: user?.profile_image_url || "",
    aadhaar_front_url: user?.aadhaar_front_url || "",
    aadhaar_back_url: user?.aadhaar_back_url || "",
    pan_card_url: user?.pan_card_url || "",
    passport_url: user?.passport_url || "",
    bank_passbook_url: user?.bank_passbook_url || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        father_name: user.father_name || "",
        mother_name: user.mother_name || "",
        nominee_name: user.nominee_name || "",
        aadhaar: user.aadhaar || "",
        pan: user.pan || "",
        account_holder_name: user.account_holder_name || "",
        account_number: user.account_number || "",
        ifsc_code: user.ifsc_code || "",
        upi_id: user.upi_id || "",
        kyc_status: user.kyc_status || "pending",
        profile_image_url: user.profile_image_url || "",
        aadhaar_front_url: user.aadhaar_front_url || "",
        aadhaar_back_url: user.aadhaar_back_url || "",
        pan_card_url: user.pan_card_url || "",
        passport_url: user.passport_url || "",
        bank_passbook_url: user.bank_passbook_url || "",
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.user_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User details updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user details",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateUserMutation.mutate(formData);
  };

  if (!user) return null;

  const userInitials = (formData.full_name || "U").split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details - {formData.full_name || "User"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.profile_image_url} alt={formData.full_name} />
              <AvatarFallback className="bg-gradient-primary text-white text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{formData.full_name || "User"}</h3>
              <p className="text-sm text-muted-foreground">User ID: {user.user_id}</p>
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" data-testid="tab-personal">Personal</TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
              <TabsTrigger value="bank" data-testid="tab-bank">Bank</TabsTrigger>
              <TabsTrigger value="kyc" data-testid="tab-kyc">KYC</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    data-testid="input-admin-full-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    data-testid="input-admin-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father_name">Father's Name</Label>
                  <Input
                    id="father_name"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    data-testid="input-admin-father-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_name">Mother's Name</Label>
                  <Input
                    id="mother_name"
                    value={formData.mother_name}
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                    data-testid="input-admin-mother-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nominee_name">Nominee Name</Label>
                  <Input
                    id="nominee_name"
                    value={formData.nominee_name}
                    onChange={(e) => setFormData({ ...formData, nominee_name: e.target.value })}
                    data-testid="input-admin-nominee"
                  />
                </div>
              </div>
              
              <FileUpload
                label="Profile Image"
                accept="image/*"
                currentFile={formData.profile_image_url}
                bucket="profiles"
                onUploadComplete={(url) => setFormData({ ...formData, profile_image_url: url })}
                maxSizeMB={2}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                    maxLength={12}
                    data-testid="input-admin-aadhaar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    maxLength={10}
                    data-testid="input-admin-pan"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FileUpload
                  label="Aadhaar Front"
                  accept="image/*"
                  currentFile={formData.aadhaar_front_url}
                  bucket="documents"
                  onUploadComplete={(url) => setFormData({ ...formData, aadhaar_front_url: url })}
                />
                <FileUpload
                  label="Aadhaar Back"
                  accept="image/*"
                  currentFile={formData.aadhaar_back_url}
                  bucket="documents"
                  onUploadComplete={(url) => setFormData({ ...formData, aadhaar_back_url: url })}
                />
                <FileUpload
                  label="PAN Card"
                  accept="image/*"
                  currentFile={formData.pan_card_url}
                  bucket="documents"
                  onUploadComplete={(url) => setFormData({ ...formData, pan_card_url: url })}
                />
                <FileUpload
                  label="Passport"
                  accept="image/*"
                  currentFile={formData.passport_url}
                  bucket="documents"
                  onUploadComplete={(url) => setFormData({ ...formData, passport_url: url })}
                />
              </div>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_holder_name">Account Holder Name</Label>
                  <Input
                    id="account_holder_name"
                    value={formData.account_holder_name}
                    onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                    data-testid="input-admin-account-holder"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    data-testid="input-admin-account-number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc_code">IFSC Code</Label>
                  <Input
                    id="ifsc_code"
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                    data-testid="input-admin-ifsc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upi_id">UPI ID</Label>
                  <Input
                    id="upi_id"
                    value={formData.upi_id}
                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                    data-testid="input-admin-upi"
                  />
                </div>
              </div>

              <FileUpload
                label="Bank Passbook"
                accept="image/*"
                currentFile={formData.bank_passbook_url}
                bucket="documents"
                onUploadComplete={(url) => setFormData({ ...formData, bank_passbook_url: url })}
              />
            </TabsContent>

            <TabsContent value="kyc" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kyc_status">KYC Status</Label>
                <Select
                  value={formData.kyc_status}
                  onValueChange={(value) => setFormData({ ...formData, kyc_status: value })}
                >
                  <SelectTrigger data-testid="select-kyc-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Account Balance</h3>
                <p className="text-2xl font-bold">₹{user.current_balance?.toLocaleString() || 0}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Deposited</p>
                    <p className="font-semibold">₹{user.total_deposited?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Withdrawn</p>
                    <p className="font-semibold">₹{user.total_withdrawn?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-user-edit"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateUserMutation.isPending}
              data-testid="button-save-user-edit"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
