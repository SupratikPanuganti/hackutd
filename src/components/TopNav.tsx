import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCallback, useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAgentic } from "@/contexts/AgenticContext";
import { isVoiceIntegrationConfigured } from "@/lib/vapiClient";
import { useToast } from "@/hooks/use-toast";
import { SentimentDisplay } from "@/components/SentimentDisplay";
import { useUser } from "@/contexts/UserContext";

export const TopNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTogglingAgent, setIsTogglingAgent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveringPath, setHoveringPath] = useState<string | null>(null); // NEW
  const { isEnabled, enableAgenticMode, disableAgenticMode, startVoiceAssistant, stopVoiceAssistant } = useAgentic();
  const { toast } = useToast();
  const location = useLocation();
  const { user, isAdmin, logout } = useUser();

  // Shared T-Mobile magenta gradient
  const MAGENTA_GRADIENT =
    "bg-gradient-to-r from-[#5A0040] to-[#E20074] text-white border-0 shadow-lg hover:shadow-xl";

  // Hover-only gradient (for inactive tabs)
  const MAGENTA_HOVER =
    "hover:bg-gradient-to-r hover:from-[#5A0040] hover:to-[#E20074] hover:text-white hover:border-transparent";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define all possible links with role requirements
  const allLinks = [
    { to: "/plans", label: "Plans", roles: ['user'] },
    { to: "/devices", label: "Devices", roles: ['user'] },
    { to: "/status", label: "Network", roles: ['user', 'admin'] },
    { to: "/help", label: "Help", roles: ['user'] },
    { to: "/admin", label: "Admin", roles: ['admin'] },
  ];

  // Filter links based on user role
  const links = useMemo(() => {
    if (!user) {
      // If no user is logged in, show all links except admin
      return allLinks.filter(link => link.to !== '/admin');
    }

    // Filter based on user's role
    return allLinks.filter(link =>
      link.roles.includes(user.role)
    );
  }, [user]);

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  const handleAgentToggle = useCallback(async () => {
    console.log('[TopNav] Toggle clicked. isEnabled:', isEnabled, 'isTogglingAgent:', isTogglingAgent);

    if (isTogglingAgent) {
      console.log('[TopNav] Already toggling, ignoring click');
      return;
    }

    setIsTogglingAgent(true);

    try {
      if (isEnabled) {
        // Disabling - just turn it off directly
        console.log('[TopNav] Disabling agent mode...');
        await stopVoiceAssistant();
        disableAgenticMode();
        toast({ title: "AI Agent Disabled", description: "AI agent mode has been turned off." });
      } else {
        // Enabling - directly enable without dialog
        console.log('[TopNav] Enabling agent mode directly...');
        const success = await enableAgenticMode();
        console.log('[TopNav] enableAgenticMode result:', success);

        if (success) {
          // Enhanced logging to debug voice integration
          console.log('[TopNav] 🔍 VOICE INTEGRATION CHECK:', {
            isConfigured: isVoiceIntegrationConfigured(),
            envVars: {
              publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY ? '✅ SET' : '❌ NOT SET',
              assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID ? '✅ SET' : '❌ NOT SET',
            }
          });

          if (isVoiceIntegrationConfigured()) {
            try {
              console.log('[TopNav] ✅ Voice configured! Starting voice assistant...');
              await startVoiceAssistant();
              toast({
                title: "AI Agent Activated! 🎉",
                description: "Your AI assistant is ready. Camera and microphone are active."
              });
            } catch (error) {
              console.error('[TopNav] ❌ Failed to start voice assistant:', error);
              console.error('[TopNav] Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
              });
              toast({
                title: "Voice Failed",
                description: `Voice couldn't start: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: "destructive"
              });
            }
          } else {
            console.warn('[TopNav] ⚠️ Voice integration NOT configured');
            console.warn('[TopNav] Environment check:', {
              VITE_VAPI_PUBLIC_KEY: import.meta.env.VITE_VAPI_PUBLIC_KEY || 'MISSING',
              VITE_VAPI_ASSISTANT_ID: import.meta.env.VITE_VAPI_ASSISTANT_ID || 'MISSING',
            });
            toast({
              title: "Agent Mode Enabled (Camera Only)",
              description: "Voice requires VAPI credentials. Restart frontend after adding them to .env"
            });
          }
        } else {
          console.error('[TopNav] Failed to enable agent mode - permissions denied');
          toast({
            title: "Permissions Required",
            description: "Please grant camera and microphone access to enable AI agent mode.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('[TopNav] Error toggling agent mode:', error);
      toast({
        title: "Error",
        description: "We couldn't toggle the AI agent mode. Please try again.",
        variant: "destructive"
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
            {links.map((link) => {
              const active = isActive(link.to);
              const showActiveGradient =
                active && (!hoveringPath || hoveringPath === link.to);

              return (
                <Link key={link.to} to={link.to} className="relative z-20">
                  <Button
                    variant="ghost"
                    onMouseEnter={() => setHoveringPath(link.to)}
                    onMouseLeave={() => setHoveringPath(null)}
                    className={cn(
                      "rounded-xl px-4 py-2 transition-all duration-200 backdrop-blur-sm",
                      showActiveGradient
                        ? cn(MAGENTA_GRADIENT, "hover:brightness-110")
                        : cn(
                          "text-white border border-transparent",
                          "bg-transparent",
                          "hover:brightness-110",
                          MAGENTA_HOVER // magenta on hover for inactive OR when another is hovered
                        )
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 relative z-20">
            <SentimentDisplay />
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
            {/* Sign In/User Menu */}
            {user ? (
              <Button
                size="sm"
                onClick={logout}
                className={cn(
                  "inline-flex rounded-xl relative z-20 transition-all duration-300 backdrop-blur-md",
                  MAGENTA_GRADIENT,
                  "px-4 py-2 hover:brightness-110"
                )}
              >
                {user.first_name || 'User'} (Logout)
              </Button>
            ) : (
              <Link to="/login" className="relative z-20">
                <Button
                  size="sm"
                  className={cn(
                    "inline-flex rounded-xl relative z-20 transition-all duration-300 backdrop-blur-md",
                    MAGENTA_GRADIENT,
                    "px-4 py-2 hover:brightness-110"
                  )}
                >
                  Sign In
                </Button>
              </Link>
            )}
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
                    "w-full justify-start rounded-xl relative z-20 backdrop-blur-sm py-3 transition-all",
                    isActive(link.to)
                      ? cn(MAGENTA_GRADIENT, "hover:brightness-110")
                      : cn(
                        "text-white border border-transparent",
                        "bg-transparent",
                        "hover:brightness-110",
                        MAGENTA_HOVER
                      )
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            {/* Sentiment Display Mobile */}
            <div className="w-full">
              <SentimentDisplay />
            </div>

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

            {/* Sign In/User Menu (gradient) */}
            {user ? (
              <Button
                size="sm"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full rounded-xl relative z-20 transition-all duration-300 backdrop-blur-md py-3",
                  MAGENTA_GRADIENT,
                  "hover:brightness-110"
                )}
              >
                {user.first_name || 'User'} (Logout)
              </Button>
            ) : (
              <Link to="/login" className="flex-1 relative z-20" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  size="sm"
                  className={cn(
                    "w-full rounded-xl relative z-20 transition-all duration-300 backdrop-blur-md py-3",
                    MAGENTA_GRADIENT,
                    "hover:brightness-110"
                  )}
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
