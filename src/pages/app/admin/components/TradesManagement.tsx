import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const TradesManagement = () => {
  const { data: trades, isLoading } = useQuery({
    queryKey: ['admin-trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          user_profiles(full_name)
        `)
        .order('entry_time', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">All Trades</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Script</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Type</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">Entry</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">Exit</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">Qty</th>
              <th className="text-right py-3 px-4 text-sm font-semibold">P/L</th>
              <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades?.map((trade) => (
              <tr key={trade.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">{trade.user_profiles?.full_name || 'Unknown'}</td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-semibold">{trade.script_name}</p>
                    <p className="text-xs text-muted-foreground">{trade.exchange}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={trade.trade_type === 'BUY' ? 'default' : 'secondary'}>
                    {trade.trade_type}
                  </Badge>
                </td>
                <td className="text-right py-3 px-4">₹{trade.entry_price}</td>
                <td className="text-right py-3 px-4">{trade.exit_price ? `₹${trade.exit_price}` : '-'}</td>
                <td className="text-right py-3 px-4">{trade.quantity}</td>
                <td className="text-right py-3 px-4">
                  {trade.profit_loss && (
                    <span
                      className={`font-semibold flex items-center justify-end gap-1 ${
                        trade.profit_loss > 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {trade.profit_loss > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      ₹{Math.abs(Number(trade.profit_loss)).toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={trade.status === 'closed' ? 'outline' : 'default'}>
                    {trade.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
