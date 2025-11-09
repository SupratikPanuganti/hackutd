import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface StatusCardProps {
  score: number;
  sparkline: number[];
  health: "ok" | "degraded";
  eta: number | null;
  towerId: string | null;
  stepsTried: string[];
}

export const StatusCard = ({ score, sparkline, health, eta, towerId, stepsTried }: StatusCardProps) => {
  const chartData = sparkline.map((value, index) => ({ value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network Health</span>
          <Badge 
            variant={health === "ok" ? "default" : "secondary"}
            data-testid="status-badge"
            className="rounded-lg"
          >
            {health === "ok" ? (
              <>✓ Operational</>
            ) : (
              <>⚠ Degraded</>
            )}
          </Badge>
        </div>

        {/* Happiness Score Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Happiness Score</span>
            <span className="text-sm font-semibold">{(score * 100).toFixed(0)}%</span>
          </div>
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ETA */}
        {eta && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">⏱</span>
            <span className="text-muted-foreground">Estimated resolution:</span>
            <span className="font-semibold" data-testid="eta-minutes">{eta} minutes</span>
          </div>
        )}

        {/* Tower ID */}
        {towerId && (
          <div className="text-sm">
            <span className="text-muted-foreground">Affected Tower: </span>
            <span className="font-mono font-semibold">{towerId}</span>
          </div>
        )}

        {/* Steps Tried */}
        {stepsTried.length > 0 && (
          <div>
            <span className="text-sm text-muted-foreground block mb-2">Troubleshooting Steps:</span>
            <div className="flex flex-wrap gap-1">
              {stepsTried.map((step, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {step.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
