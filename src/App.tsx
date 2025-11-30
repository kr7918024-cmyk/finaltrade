import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AppLayout from "./components/AppLayout";
import Home from "./pages/app/Home";
import Funds from "./pages/app/Funds";
import Reports from "./pages/app/Reports";
import Messages from "./pages/app/Messages";
import Account from "./pages/app/Account";
import AdminDashboard from "./pages/app/admin/Dashboard";
import AdminSetup from "./pages/AdminSetup";
import NotFound from "./pages/NotFound";
import ForgotPasswordOtp from '@/pages/auth/ForgotPasswordOtp';
import ResetPasswordOtp from '@/pages/auth/ResetPasswordOtp';


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth/forgot-password" element={<ForgotPasswordOtp />} />
<Route path="/auth/reset-password-otp" element={<ResetPasswordOtp />} />

          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/app" element={<AppLayout />}>
            <Route path="home" element={<Home />} />
            <Route path="funds" element={<Funds />} />
            <Route path="reports" element={<Reports />} />
            <Route path="messages" element={<Messages />} />
            <Route path="account" element={<Account />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
