import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Shield, BarChart3 } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />
      
      <div className="relative">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Meta Traders
              </span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Please sign-in to your account
                <br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  and start the adventure
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Access real-time trading performance, manage funds, and view comprehensive trade reports in one secure platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => navigate("/auth/login")}
              >
                Sign In
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate("/auth/signup")}
              >
                Sign Up
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 pt-20">
              <div className="space-y-3 p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Real-Time Performance</h3>
                <p className="text-sm text-muted-foreground">
                  Track your daily profits and losses with live updates and visual indicators
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Secure Fund Management</h3>
                <p className="text-sm text-muted-foreground">
                  Seamlessly add funds and request withdrawals with full transparency
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mx-auto">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Comprehensive Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Access detailed trade reports with profit calculations and analytics
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;