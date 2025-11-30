import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";

const Home = () => {
  // Get today's trades
  const { data: todayTrades, isLoading: tradesLoading } = useQuery({
    queryKey: ['trades', 'today'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfToday)
        .lte('created_at', endOfToday)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Get user profile for balance info
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const isLoading = tradesLoading || profileLoading;

  // Calculate today's statistics
  // Note: profit_loss in the trades table should already be quantity-adjusted
  // If it's not, admin should calculate it as: (exit_price - entry_price) * quantity when adding trades
  const totalProfit = todayTrades?.reduce((sum, trade) => {
    return sum + (trade.profit_loss && trade.profit_loss > 0 ? trade.profit_loss : 0);
  }, 0) || 0;

  const totalLoss = todayTrades?.reduce((sum, trade) => {
    return sum + (trade.profit_loss && trade.profit_loss < 0 ? Math.abs(trade.profit_loss) : 0);
  }, 0) || 0;

  const netTotal = totalProfit - totalLoss;
  const profitRatio = totalProfit + totalLoss > 0 
    ? ((totalProfit / (totalProfit + totalLoss)) * 100).toFixed(1) 
    : 0;

  // Generate cumulative chart data from trades
  // First, sort trades in chronological order (oldest first)
  const chronologicalTrades = [...(todayTrades || [])].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    return timeA - timeB; // Ascending order
  });

  // Then build cumulative P/L
  let cumulative = 0;
  const chartData = chronologicalTrades.map(trade => {
    cumulative += trade.profit_loss || 0;
    return {
      time: trade.created_at ? format(new Date(trade.created_at), 'HH:mm') : '',
      value: cumulative,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Today's Working</h1>
        <p className="text-muted-foreground">
          Your daily trading performance overview
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-success border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 mb-1">Total Profit</p>
              {isLoading ? (
                <div className="h-9 w-24 bg-white/20 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-white" data-testid="text-total-profit">
                  ₹{totalProfit.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-white/80 flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4" />
                {todayTrades?.filter(t => (t.profit_loss || 0) > 0).length || 0} profitable trades
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-danger border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 mb-1">Total Loss</p>
              {isLoading ? (
                <div className="h-9 w-24 bg-white/20 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-white" data-testid="text-total-loss">
                  ₹{totalLoss.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-white/80 flex items-center gap-1 mt-2">
                <TrendingDown className="h-4 w-4" />
                {todayTrades?.filter(t => (t.profit_loss || 0) < 0).length || 0} losing trades
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-primary border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80 mb-1">Net Total</p>
              {isLoading ? (
                <div className="h-9 w-24 bg-white/20 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-white" data-testid="text-net-total">
                  ₹{netTotal.toLocaleString()}
                </p>
              )}
              <p className="text-sm text-white/80 flex items-center gap-1 mt-2">
                <DollarSign className="h-4 w-4" />
                {profitRatio}% profit ratio
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Profit/Loss Chart</h2>
          <p className="text-sm text-muted-foreground">Today's trade performance</p>
        </div>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg animate-pulse" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No trades yet today</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Recent Trades</h2>
          <p className="text-sm text-muted-foreground">Last 5 trades today</p>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
              ))}
            </>
          ) : todayTrades && todayTrades.length > 0 ? (
            todayTrades.slice(0, 5).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                data-testid={`trade-${trade.id}`}
              >
                <div>
                  <p className="font-semibold">{trade.script_name}</p>
                  <p className="text-sm text-muted-foreground">{trade.trade_type}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold flex items-center gap-1 ${
                      (trade.profit_loss || 0) >= 0 ? "text-success" : "text-destructive"
                    }`}
                    data-testid={`pl-${trade.id}`}
                  >
                    {(trade.profit_loss || 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    ₹{Math.abs(trade.profit_loss || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(trade.profit_loss || 0) >= 0 ? "Profit" : "Loss"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No trades yet today</p>
              <p className="text-sm">Your recent trades will appear here</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Home;