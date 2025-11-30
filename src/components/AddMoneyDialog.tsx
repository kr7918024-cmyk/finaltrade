import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "./FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMoneyDialog = ({ open, onOpenChange }: AddMoneyDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank">("upi");
  const [amount, setAmount] = useState("");
  const [screenshot, setScreenshot] = useState("");

  // Temporary: Hard-coded payment settings until migration is run
  const paymentSettings = {
    upi_id: "metatraders@upi",
    qr_code_url: null as string | null,
    bank_name: "State Bank of India",
    account_holder_name: "Meta Traders",
    account_number: "1234567890",
    ifsc_code: "SBIN0001234",
  };

  // TODO: Uncomment this after running the database migration
  // const { data: paymentSettings } = useQuery({
  //   queryKey: ['admin-payment-settings'],  // Use consistent query key
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('admin_payment_settings')
  //       .select('*')
  //       .single();
  //     
  //     if (error) throw error;
  //     return data || {
  //       upi_id: "",
  //       qr_code_url: null,
  //       bank_name: "",
  //       account_holder_name: "",
  //       account_number: "",
  //       ifsc_code: "",
  //     };
  //   },
  // });

  const createRequestMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('fund_requests')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          request_type: 'deposit',
          payment_method: paymentMethod,
          screenshot_url: screenshot,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Success",
        description: "Fund request submitted successfully. Waiting for admin approval.",
      });
      onOpenChange(false);
      resetDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  const resetDialog = () => {
    setStep(1);
    setAmount("");
    setScreenshot("");
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!screenshot) {
      toast({
        title: "Error",
        description: "Please upload payment screenshot",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-add-money">
        <DialogHeader>
          <DialogTitle>
            Add Money - Step {step} of 3
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <RadioGroupItem value="upi" id="upi" data-testid="radio-upi" />
                  <Label htmlFor="upi" className="cursor-pointer flex-1">
                    UPI Payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                  <RadioGroupItem value="bank" id="bank" data-testid="radio-bank" />
                  <Label htmlFor="bank" className="cursor-pointer flex-1">
                    Bank Transfer
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {paymentMethod === "upi" ? (
                <>
                  <div className="space-y-2">
                    <Label>UPI ID</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={paymentSettings.upi_id}
                        readOnly
                        data-testid="input-upi-id"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentSettings.upi_id)}
                        data-testid="button-copy-upi"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {paymentSettings.qr_code_url && (
                    <div className="space-y-2">
                      <Label>QR Code</Label>
                      <div className="border rounded-lg p-4 flex justify-center">
                        <img
                          src={paymentSettings.qr_code_url}
                          alt="Payment QR Code"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={paymentSettings.bank_name}
                        readOnly
                        data-testid="input-bank-name"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentSettings.bank_name)}
                        data-testid="button-copy-bank-name"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={paymentSettings.account_holder_name}
                        readOnly
                        data-testid="input-account-holder"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentSettings.account_holder_name)}
                        data-testid="button-copy-holder"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={paymentSettings.account_number}
                        readOnly
                        data-testid="input-account-number"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentSettings.account_number)}
                        data-testid="button-copy-account"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={paymentSettings.ifsc_code}
                        readOnly
                        data-testid="input-ifsc"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentSettings.ifsc_code)}
                        data-testid="button-copy-ifsc"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Copy the payment details and complete the payment. Upload the screenshot in the next step.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-amount"
                />
              </div>

              <FileUpload
                label="Upload Payment Screenshot *"
                accept="image/*"
                onUploadComplete={setScreenshot}
                currentFile={screenshot}
                bucket="fund-screenshots"
              />

              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Almost Done!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your request will be reviewed by admin and funds will be added once approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              data-testid="button-back"
            >
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-primary hover:opacity-90"
                data-testid="button-next"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createRequestMutation.isPending}
                className="bg-gradient-primary hover:opacity-90"
                data-testid="button-submit"
              >
                {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
