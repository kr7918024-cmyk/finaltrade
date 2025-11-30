import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<number>(1); // 1 - Personal, 2 - Documents, 3 - Bank
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Personal Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [nomineeName, setNomineeName] = useState("");

  // IDs
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");

  // Bank Info
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  // validation helpers
  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isMobile = (v: string) => /^\d{10}$/.test(v);
  const isAadhaar = (v: string) => /^\d{12}$/.test(v.replace(/\s+/g, ""));
  const isPan = (v: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase());
  const isIfsc = (v: string) => /^[A-Z]{4}0[0-9A-Z]{6}$/.test(v.toUpperCase());
  const isAccountNo = (v: string) => v.trim().length >= 9; // vary by bank but require >=9 chars
  const isPasswordStrong = (v: string) => v.length >= 8;

  const validateStep1 = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Full name is required", variant: "destructive" });
      return false;
    }
    if (!mobile.trim() || !isMobile(mobile.trim())) {
      toast({ title: "Error", description: "Valid 10 digit mobile number is required", variant: "destructive" });
      return false;
    }
    if (!email.trim() || !isEmail(email.trim())) {
      toast({ title: "Error", description: "A valid email is required", variant: "destructive" });
      return false;
    }
    if (!isPasswordStrong(password)) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return false;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return false;
    }
    // optional but require nominee/father/mother? As per request everything compulsory — require nominee and parents too
    if (!fatherName.trim()) {
      toast({ title: "Error", description: "Father's name is required", variant: "destructive" });
      return false;
    }
    if (!motherName.trim()) {
      toast({ title: "Error", description: "Mother's name is required", variant: "destructive" });
      return false;
    }
    if (!nomineeName.trim()) {
      toast({ title: "Error", description: "Nominee name is required", variant: "destructive" });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!aadhaar.trim() || !isAadhaar(aadhaar)) {
      toast({ title: "Error", description: "Valid 12 digit Aadhaar number is required", variant: "destructive" });
      return false;
    }
    if (!pan.trim() || !isPan(pan)) {
      toast({ title: "Error", description: "Valid PAN in format ABCDE1234F is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!accountHolder.trim()) {
      toast({ title: "Error", description: "Account holder name is required", variant: "destructive" });
      return false;
    }
    if (!accountNumber.trim() || !isAccountNo(accountNumber)) {
      toast({ title: "Error", description: "Valid account number is required (at least 9 characters)", variant: "destructive" });
      return false;
    }
    if (!ifsc.trim() || !isIfsc(ifsc)) {
      toast({ title: "Error", description: "Valid IFSC code is required (eg. ABCA0123456)", variant: "destructive" });
      return false;
    }
    // UPI optional in UI, but requirement says everything compulsory — we'll require either UPI or account+ifsc. Keep UPI optional.
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // final validation
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;
    if (!termsAccepted) {
      toast({ title: "Error", description: "Please accept the terms and conditions", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app/home`,
          data: {
            name: name.trim(),
            mobile: mobile.trim(),
            father_name: fatherName.trim(),
            mother_name: motherName.trim(),
            nominee_name: nomineeName.trim(),
            aadhaar: aadhaar.trim(),
            pan: pan.trim().toUpperCase(),
            account_holder: accountHolder.trim(),
            account_number: accountNumber.trim(),
            ifsc: ifsc.trim().toUpperCase(),
            upi_id: upiId.trim() || null,
          },
        },
      });

      if (error) throw error;

      toast({ title: "Success", description: "Account created successfully! Please check your email for verification." });
      navigate("/auth/login");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create account", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />

      <div className="relative w-full max-w-2xl">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Meta Traders</span>
            </div>
            <h1 className="text-2xl font-bold text-center">Create your account</h1>
            <p className="text-muted-foreground text-center text-sm">Complete KYC to get started with trading</p>

            {/* Step indicator */}
            <div className="mt-4 flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm ${step===1?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>1. Personal</div>
              <div className={`px-3 py-1 rounded-full text-sm ${step===2?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>2. Documents</div>
              <div className={`px-3 py-1 rounded-full text-sm ${step===3?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>3. Bank</div>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10 digit mobile" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name *</Label>
                    <Input id="fatherName" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name *</Label>
                    <Input id="motherName" value={motherName} onChange={(e) => setMotherName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomineeName">Nominee Name *</Label>
                    <Input id="nomineeName" value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} required />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" onClick={nextStep} className="bg-gradient-primary">Next</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                    <Input id="aadhaar" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} placeholder="123412341234" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number *</Label>
                    <Input id="pan" value={pan} onChange={(e) => setPan(e.target.value)} placeholder="ABCDE1234F" required />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                  <p className="font-medium mb-2">Document Upload</p>
                  <p>Document uploads (Aadhaar, PAN, etc.) will be available after account creation in your account settings.</p>
                </div>

                <div className="flex justify-between gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={prevStep}>Back</Button>
                  <Button type="button" onClick={nextStep} className="bg-gradient-primary">Next</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name *</Label>
                    <Input id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC Code *</Label>
                    <Input id="ifsc" value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="ABCD0123456" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID *</Label>
                    <Input id="upiId" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" required />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                  <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">I accept the terms and conditions *</label>
                </div>

                <div className="flex justify-between gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={prevStep}>Back</Button>
                  <Button type="submit" className="w-1/2 bg-gradient-primary" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</Button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account? <Link to="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
