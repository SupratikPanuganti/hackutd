import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Bot } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { useAgentic } from "@/contexts/AgenticContext";
import { useToast } from "@/hooks/use-toast";

export const TopNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTogglingAgent, setIsTogglingAgent] = useState(false);
  const { isEnabled, enableAgenticMode, disableAgenticMode } = useAgentic();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/plans", label: "Plans" },
    { to: "/devices", label: "Devices" },
    { to: "/status", label: "Network" },
    { to: "/help", label: "Help" },
  ];

  const handleAgentToggle = useCallback(async () => {
    if (isTogglingAgent) return;

    setIsTogglingAgent(true);

    try {
      if (isEnabled) {
        disableAgenticMode();
        toast({
          title: "AI Agent Disabled",
          description: "AI agent mode has been turned off.",
        });
      } else {
        const success = await enableAgenticMode();

        if (success) {
          toast({
            title: "AI Agent Activated! 🎉",
            description: "Your AI assistant is now available throughout your journey.",
          });
          navigate("/assist", { state: { autoStartVoice: true } });
        } else {
          toast({
            title: "Permissions Required",
            description: "Please grant camera or microphone access to enable AI agent mode.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "We couldn't toggle the AI agent mode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingAgent(false);
    }
  }, [disableAgenticMode, enableAgenticMode, isEnabled, isTogglingAgent, navigate, toast]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-foreground">
              T-<span className="text-primary">Care</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-foreground transition-all",
                    (location.pathname === link.to ||
                      (link.to !== "/" && location.pathname.startsWith(link.to))) &&
                      "border border-primary text-primary shadow-sm bg-primary/5"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="text-foreground/80">Current Sentiment:</span>
              <span className="ml-2 rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-400">
                Positive
              </span>
            </div>
            <Button
              variant={isEnabled ? "secondary" : "outline"}
              size="sm"
              className="hidden md:inline-flex items-center gap-1"
              onClick={handleAgentToggle}
              disabled={isTogglingAgent}
            >
              <Bot className="h-3 w-3" />
              {isEnabled ? "Disable AI" : "Enable AI"}
            </Button>
            <Button variant="outline" size="sm" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-foreground transition-all",
                    (location.pathname === link.to ||
                      (link.to !== "/" && location.pathname.startsWith(link.to))) &&
                      "border border-primary text-primary shadow-sm bg-primary/5"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground/80">Current Sentiment:</span>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-400">
                Positive
              </span>
            </div>
            <Button
              variant={isEnabled ? "secondary" : "outline"}
              size="sm"
              className="w-full justify-start inline-flex items-center gap-2"
              onClick={handleAgentToggle}
              disabled={isTogglingAgent}
            >
              <Bot className="h-4 w-4" />
              {isEnabled ? "Disable AI" : "Enable AI"}
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
