import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { getMapboxToken, hasCustomMapboxToken } from "@/lib/mapbox";

export const MapboxDebug = () => {
  const resolvedToken = getMapboxToken();
  const hasCustomToken = hasCustomMapboxToken();
  const tokenSnippet = `${resolvedToken.substring(0, 20)}...${resolvedToken.substring(
    resolvedToken.length - 10
  )}`;
  const isValidFormat = resolvedToken.startsWith("pk.");
  const tokenLength = resolvedToken.length;
  
  // Typical Mapbox token length is around 100+ characters
  const isProperLength = tokenLength > 80;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Mapbox Token Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Custom Token Loaded:</span>
          {hasCustomToken ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Yes - Using .env
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              No - Using Fallback
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Valid Format (pk.):</span>
          {isValidFormat ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Valid
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Invalid
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Token Length:</span>
          <Badge variant={isProperLength ? "default" : "secondary"}>
            {tokenLength} chars {isProperLength ? "✓" : "⚠️"}
          </Badge>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs font-mono break-all">
            {tokenSnippet}
          </p>
        </div>

        {!hasCustomToken && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Using fallback token. Create a <code className="bg-black/20 px-1 rounded">.env</code> file with:
            </p>
            <code className="text-xs mt-2 block bg-black/30 p-2 rounded">
              VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here
            </code>
            <code className="text-xs mt-2 block bg-black/30 p-2 rounded">
              MAPBOX_ACCESS_TOKEN=pk.your_token_here
            </code>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted/80 rounded-lg space-y-1 text-xs font-mono">
          <div>Resolved Token: <span className="break-all">{tokenSnippet}</span></div>
          <div>Env.VITE_MAPBOX_ACCESS_TOKEN: {import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ? "set" : "not set"}</div>
          <div>Env.MAPBOX_ACCESS_TOKEN: {import.meta.env.MAPBOX_ACCESS_TOKEN ? "set" : "not set"}</div>
          <div>Fallback Token Used: {hasCustomToken ? "No" : "Yes (default)"}</div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>Get your free token at: <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Mapbox Dashboard</a></p>
        </div>
      </CardContent>
    </Card>
  );
};



