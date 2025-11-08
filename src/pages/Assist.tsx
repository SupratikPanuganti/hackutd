import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { ConversationPanel } from "@/components/assist/ConversationPanel";
import { StatusCard } from "@/components/assist/StatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Assist = () => {
  const location = useLocation();
  const [sessionId] = useState(`sess_${Date.now()}`);
  const [currentState, setCurrentState] = useState("START");
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>();
  const [statusData, setStatusData] = useState({
    score: 0.46,
    sparkline: [0.71, 0.69, 0.65, 0.58, 0.52, 0.46],
    health: "degraded" as "ok" | "degraded",
    eta: 35,
    towerId: "eNB-123",
    stepsTried: ["toggle_airplane", "apn_check", "dns_probe"],
  });

  useEffect(() => {
    if (location.state?.initialQuestion) {
      setInitialQuestion(location.state.initialQuestion);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1 bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">AI Support Assistant</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Session:</span>
              <code className="text-xs bg-card px-2 py-1 rounded">{sessionId}</code>
              <Badge variant="outline" className="ml-2">{currentState}</Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conversation Panel */}
            <div className="lg:col-span-2">
              <Card className="h-[calc(100vh-16rem)]">
                <CardHeader>
                  <CardTitle>Conversation</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100%-5rem)]">
              <ConversationPanel 
                sessionId={sessionId} 
                onStateChange={setCurrentState}
                initialQuestion={initialQuestion}
              />
                </CardContent>
              </Card>
            </div>

            {/* Status Panel */}
            <div className="space-y-6">
              <StatusCard {...statusData} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Diagnostic Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${currentState === "START" ? "bg-primary" : "bg-muted"}`} />
                      <span className={currentState === "START" ? "font-semibold" : "text-muted-foreground"}>Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${currentState === "INTENT_DETECTED" ? "bg-primary" : "bg-muted"}`} />
                      <span className={currentState === "INTENT_DETECTED" ? "font-semibold" : "text-muted-foreground"}>Intent Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${currentState === "CHECK_STATUS" ? "bg-primary" : "bg-muted"}`} />
                      <span className={currentState === "CHECK_STATUS" ? "font-semibold" : "text-muted-foreground"}>Status Check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${currentState === "PLAYBOOK_STEPS" ? "bg-primary" : "bg-muted"}`} />
                      <span className={currentState === "PLAYBOOK_STEPS" ? "font-semibold" : "text-muted-foreground"}>Playbook Steps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${currentState === "VERIFY" ? "bg-primary" : "bg-muted"}`} />
                      <span className={currentState === "VERIFY" ? "font-semibold" : "text-muted-foreground"}>Verify</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${currentState === "CLOSE" ? "bg-primary" : "bg-muted"}`} />
                      <span className={currentState === "CLOSE" ? "font-semibold" : "text-muted-foreground"}>Close</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Assist;
