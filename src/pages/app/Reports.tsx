import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

const Reports = () => {
  const trades = [
    {
      script: "NIFTY 50",
      exchange: "NSE",
      type: "BUY",
      entryPrice: 21500,
      exitPrice: 21680,
      quantity: 50,
      pl: 9000,
      plPercent: 0.84,
      date: "2025-11-11",
      time: "10:35",
    },
    {
      script: "BANKNIFTY",
      exchange: "NSE",
      type: "SELL",
      entryPrice: 45200,
      exitPrice: 45100,
      quantity: 25,
      pl: 2500,
      plPercent: 0.22,
      date: "2025-11-11",
      time: "11:20",
    },
    {
      script: "RELIANCE",
      exchange: "NSE",
      type: "BUY",
      entryPrice: 2450,
      exitPrice: 2420,
      quantity: 100,
      pl: -3000,
      plPercent: -1.22,
      date: "2025-11-11",
      time: "14:15",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trade Reports</h1>
          <p className="text-muted-foreground">View your trading history</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Trades</p>
          <p className="text-3xl font-bold">{trades.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Winning Trades</p>
          <p className="text-3xl font-bold text-success">
            {trades.filter((t) => t.pl > 0).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Losing Trades</p>
          <p className="text-3xl font-bold text-destructive">
            {trades.filter((t) => t.pl < 0).length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Trades</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold">Script</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Type</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Entry</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Exit</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Qty</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">P/L</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">%</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold">{trade.script}</p>
                      <p className="text-xs text-muted-foreground">{trade.exchange}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.type === "BUY"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">₹{trade.entryPrice}</td>
                  <td className="text-right py-3 px-4">₹{trade.exitPrice}</td>
                  <td className="text-right py-3 px-4">{trade.quantity}</td>
                  <td className="text-right py-3 px-4">
                    <span
                      className={`font-semibold flex items-center justify-end gap-1 ${
                        trade.pl > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {trade.pl > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      ₹{Math.abs(trade.pl).toLocaleString()}
                    </span>
                  </td>
                  <td
                    className={`text-right py-3 px-4 font-semibold ${
                      trade.plPercent > 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {trade.plPercent > 0 ? "+" : ""}
                    {trade.plPercent}%
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-muted-foreground">
                    {trade.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;