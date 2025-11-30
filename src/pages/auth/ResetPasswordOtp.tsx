// src/pages/auth/ResetPasswordOtp.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordOtp() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({ title: "Error", description: "Password min 8 chars", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Error", description: "Enter a valid email", variant: "destructive" });
      return;
    }
    if (!otp || otp.trim().length === 0) {
      toast({ title: "Error", description: "Enter the OTP", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE ?? "";
      const res = await fetch(`${apiBase}/api/verify-otp-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      // Safe parse of response
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
      }

      toast({ title: "Success", description: "Password updated. Please login." });
      navigate("/auth/login");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || err?.error || "Failed to reset password",
        variant: "destructive",
      });
      console.error("ResetPasswordOtp error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card p-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-2">Reset Password with OTP</h2>

        <form onSubmit={submit} className="space-y-3">
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

          <div>
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              placeholder="6 digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Repeat new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
