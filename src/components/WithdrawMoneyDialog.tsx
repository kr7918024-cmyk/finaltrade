import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface WithdrawMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

export function WithdrawMoneyDialog({
  open,
  onOpenChange,
  currentBalance,
}: WithdrawMoneyDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const createWithdrawalMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (withdrawAmount > currentBalance) {
        throw new Error("Insufficient balance");
      }

      if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
        throw new Error("Please fill in all bank details");
      }

      const { error } = await supabase.from("fund_requests").insert({
        user_id: user.id,
        request_type: "withdrawal",
        amount: withdrawAmount,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        account_holder_name: accountHolderName,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fund-history'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully. Waiting for admin approval.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setIfscCode("");
    setAccountHolderName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWithdrawalMutation.mutate();
  };

  const isPending = createWithdrawalMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-withdraw-money">
        <DialogHeader>
          <DialogTitle>Withdraw Money</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-balance">Available Balance</Label>
            <Input
              id="current-balance"
              value={`₹${currentBalance.toLocaleString()}`}
              readOnly
              disabled={isPending}
              className="font-semibold"
              data-testid="input-available-balance"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Withdrawal Amount *</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={currentBalance}
              required
              disabled={isPending}
              data-testid="input-withdraw-amount"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-3">Bank Details</p>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="account-holder">Account Holder Name *</Label>
                <Input
                  id="account-holder"
                  placeholder="Enter account holder name"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  required
                  disabled={isPending}
                  data-testid="input-account-holder-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name *</Label>
                <Input
                  id="bank-name"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  disabled={isPending}
                  data-testid="input-bank-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-num">Account Number *</Label>
                <Input
                  id="account-num"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  disabled={isPending}
                  data-testid="input-account-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifsc">IFSC Code *</Label>
                <Input
                  id="ifsc"
                  placeholder="Enter IFSC code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  required
                  disabled={isPending}
                  data-testid="input-ifsc-code"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              data-testid="button-cancel-withdraw"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-testid="button-submit-withdraw"
            >
              {isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
