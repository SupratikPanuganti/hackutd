import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAgentic } from "@/contexts/AgenticContext";
import { isVoiceIntegrationConfigured } from "@/lib/vapiClient";
import { useToast } from "@/hooks/use-toast";

export const TopNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTogglingAgent, setIsTogglingAgent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isEnabled, enableAgenticMode, disableAgenticMode, startVoiceAssistant, stopVoiceAssistant } = useAgentic();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { to: "/plans", label: "Plans" },
    { to: "/devices", label: "Devices" },
    { to: "/status", label: "Network" },
    { to: "/help", label: "Help" },
    { to: "/admin", label: "Admin" },
  ];

  const handleAgentToggle = useCallback(async () => {
    if (isTogglingAgent) return;

    setIsTogglingAgent(true);

    try {
      if (isEnabled) {
        await stopVoiceAssistant();
        disableAgenticMode();
        toast({
          title: "AI Agent Disabled",
          description: "AI agent mode has been turned off.",
        });
      } else {
        const success = await enableAgenticMode();

        if (success) {
          if (isVoiceIntegrationConfigured()) {
            try {
              await startVoiceAssistant();
              toast({
                title: "AI Agent Activated! 🎉",
                description: "Your AI assistant is now speaking. How can I help you?",
              });
            } catch (error) {
              console.error("Failed to start voice assistant after enabling agent mode", error);
              toast({
                title: "Agent Mode Enabled",
                description: "Agent mode is active, but we couldn't start voice assistance. Check your AI configuration.",
              });
            }
          } else {
            toast({
              title: "Agent Mode Enabled",
              description: "Voice integration is disabled in this test build, so audio won't start automatically.",
            });
          }
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
  }, [disableAgenticMode, enableAgenticMode, isEnabled, isTogglingAgent, startVoiceAssistant, stopVoiceAssistant, toast]);

  return (
    <nav
      className={cn(
        "sticky top-4 md:top-6 z-50 flex justify-center px-3 sm:px-4 transition-all duration-300",
        scrolled ? "mt-2 mb-6" : "mt-6 mb-12"
      )}
    >
      <div
        className={cn(
          "relative w-full max-w-6xl backdrop-blur-xl border transition-all duration-300 group",
          "bg-white/10 border-white/20 shadow-2xl",
          "hover:bg-white/15 hover:border-white/30 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)]",
          "rounded-2xl",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 before:pointer-events-none before:rounded-2xl",
          "group-hover:before:opacity-100",
          "after:absolute after:inset-0 after:bg-gradient-to-t after:from-white/5 after:to-transparent after:opacity-0 after:transition-opacity after:duration-300 after:pointer-events-none after:rounded-2xl",
          "group-hover:after:opacity-100"
        )}
      >
        <div className="relative z-10 flex h-14 md:h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 relative z-20 group/logo"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight transition-colors duration-300 group-hover/logo:text-white drop-shadow-md whitespace-nowrap">
              T-<span className="text-white">Care</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 relative z-20">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="relative z-20">
                <Button
                  variant="ghost"
                  className={cn(
                    "text-white transition-all duration-200 rounded-xl px-4 py-2 relative z-20 backdrop-blur-sm",
                    "hover:bg-white/20 hover:text-white hover:shadow-sm hover:border-white/30 border border-transparent",
                    (location.pathname === link.to ||
                      (link.to !== "/" && location.pathname.startsWith(link.to))) &&
                      "bg-white/15 text-white border border-white/30 shadow-sm"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 relative z-20">
            <div className="inline-flex items-center gap-2 rounded-xl px-3 py-2 relative z-20 border-white/20 bg-white/10 text-white backdrop-blur-sm border">
              <span className="text-xs font-medium">Agent Mode</span>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleAgentToggle}
                disabled={isTogglingAgent}
                className={cn(
                  "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500",
                  "border-2 border-white/30"
                )}
              />
            </div>
            <Link to="/login" className="relative z-20">
              <Button
                variant="outline"
                size="sm"
                className="inline-flex rounded-xl relative z-20 transition-all duration-300 hover:bg-white/20 hover:text-white hover:border-white/30 border-white/20 bg-white/10 text-white backdrop-blur-sm"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup" className="relative z-20">
              <Button
                size="sm"
                className="inline-flex rounded-xl relative z-20 transition-all duration-300 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg hover:shadow-xl"
              >
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden relative z-20">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl relative z-20 transition-all duration-300 hover:bg-white/20 hover:text-white text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <span className="text-xl font-semibold">✕</span>
              ) : (
                <span className="text-xl font-semibold">☰</span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out rounded-b-2xl relative z-20",
            mobileMenuOpen ? "max-h-[600px] opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"
          )}
        >
          <div className="flex flex-col space-y-2 px-4 pt-3 border-t border-white/10">
            {/* Navigation Links */}
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="relative z-20"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white transition-all rounded-xl relative z-20 backdrop-blur-sm py-3",
                    "hover:bg-white/20 border border-transparent",
                    (location.pathname === link.to ||
                      (link.to !== "/" && location.pathname.startsWith(link.to))) &&
                      "bg-white/15 text-white border border-white/30"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            {/* AI Toggle */}
            <div className="w-full justify-between inline-flex items-center gap-2 rounded-xl relative z-20 border-white/20 bg-white/10 text-white backdrop-blur-sm py-3 px-4 border">
              <span className="font-medium">Agent Mode</span>
              <Switch
                checked={isEnabled}
                onCheckedChange={() => {
                  handleAgentToggle();
                  setMobileMenuOpen(false);
                }}
                disabled={isTogglingAgent}
                className={cn(
                  "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500",
                  "border-2 border-white/30"
                )}
              />
            </div>

            {/* Sign In / Sign Up */}
            <div className="flex gap-2">
              <Link to="/login" className="flex-1 relative z-20" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl relative z-20 transition-all duration-300 hover:bg-white/20 hover:text-white hover:border-white/30 border-white/20 bg-white/10 text-white backdrop-blur-sm py-3"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="flex-1 relative z-20" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  size="sm"
                  className="w-full rounded-xl relative z-20 transition-all duration-300 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg hover:shadow-xl py-3"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
