// src/pages/auth/ForgotPasswordOtp.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordOtp() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // simple email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Error",
        description: "Enter a valid email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // BASE URL — local or live (set in .env)
      const apiBase = import.meta.env.VITE_API_BASE;

      const res = await fetch(`${apiBase}/api/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // try parse JSON safely
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send OTP");
      }

      toast({
        title: "OTP Sent",
        description:
          "If this email exists, an OTP has been sent. Please check your inbox.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.error || err?.message || "Unable to send OTP. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-2">Forgot Password</h2>

        <p className="text-sm text-muted-foreground mb-4">
          Enter your email and we will send you an OTP.
        </p>

        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </form>
      </div>
    </div>
  );
}
