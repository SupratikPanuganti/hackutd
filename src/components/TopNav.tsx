import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCallback, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAgentic } from "@/contexts/AgenticContext";
import { useToast } from "@/hooks/use-toast";

export const TopNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTogglingAgent, setIsTogglingAgent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isEnabled, enableAgenticMode, disableAgenticMode } = useAgentic();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const fullScreenWidthRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Measure full screen navbar width and show dropdown when screen shrinks
  useEffect(() => {
    const measureAndCheck = () => {
      if (!navRef.current) return;
      
      const nav = navRef.current;
      const currentWindowWidth = window.innerWidth;
      
      // On first measurement, capture the full screen width
      // When navbar is w-full (mobile), it's full screen
      if (fullScreenWidthRef.current === null) {
        const navWidth = nav.offsetWidth;
        const windowWidth = window.innerWidth;
        
        // If navbar is taking up most of the window (full screen), store that width
        if (navWidth >= windowWidth * 1) {
          fullScreenWidthRef.current = navWidth;
        } else {
          // Otherwise, use window width as the full screen measurement
          fullScreenWidthRef.current = windowWidth;
        }
      }
      
      // Show mobile menu when current window width is less than the measured full screen width
      if (fullScreenWidthRef.current !== null) {
        setShowMobileMenu(currentWindowWidth < fullScreenWidthRef.current);
      }
    };

    // Initial measurement
    measureAndCheck();
    
    // Re-measure on resize (in case we need to update the constant)
    const handleResize = () => {
      // Re-measure full screen width if window gets larger
      if (fullScreenWidthRef.current !== null && window.innerWidth > fullScreenWidthRef.current) {
        fullScreenWidthRef.current = null; // Reset to re-measure
      }
      measureAndCheck();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    <nav className={cn(
      "sticky top-4 md:top-6 z-50 transition-all duration-300 flex justify-center px-2 sm:px-4",
      scrolled ? "mx-0" : "mx-0"
    )}>
      <div 
        ref={navRef}
        className={cn(
          "relative backdrop-blur-xl border transition-all duration-300 group",
          "bg-white/10 border-white/20 shadow-2xl",
          "hover:bg-white/15 hover:border-white/30 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)]",
          "rounded-xl md:rounded-2xl",
          "w-full md:max-w-[50%]",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 before:pointer-events-none before:rounded-xl md:before:rounded-2xl",
          "group-hover:before:opacity-100",
          "after:absolute after:inset-0 after:bg-gradient-to-t after:from-white/5 after:to-transparent after:opacity-0 after:transition-opacity after:duration-300 after:pointer-events-none after:rounded-xl md:after:rounded-2xl",
          "group-hover:after:opacity-100"
        )}
      >
        <div className="relative container mx-auto px-4 sm:px-6 md:px-8 z-10">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 relative z-20 group/logo" onClick={() => setMobileMenuOpen(false)}>
              <span 
                ref={logoRef}
                className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight transition-colors duration-300 group-hover/logo:text-white drop-shadow-md whitespace-nowrap"
              >
                T-<span className="text-white">Care</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className={cn(
              "items-center space-x-1 relative z-20",
              showMobileMenu ? "hidden" : "hidden md:flex"
            )}>
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
            <div className={cn(
              "items-center space-x-2 lg:space-x-3 relative z-20",
              showMobileMenu ? "hidden" : "hidden md:flex"
            )}>
              <div className="hidden lg:flex items-center rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/15">
                <span className="text-white/80 transition-colors duration-300 group-hover:text-white">Sentiment:</span>
                <span className="ml-2 rounded-md bg-emerald-500/30 px-2 py-0.5 text-white font-semibold backdrop-blur-sm border border-emerald-500/30">
                  Positive
                </span>
              </div>
              <Button
                variant={isEnabled ? "secondary" : "outline"}
                size="sm"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 relative z-20 transition-all duration-300 hover:bg-white/20 hover:text-white hover:border-white/30 border-white/20 bg-white/10 text-white backdrop-blur-sm"
                onClick={handleAgentToggle}
                disabled={isTogglingAgent}
              >
                <span className="text-xs">AI</span>
                {isEnabled ? "Off" : "On"}
              </Button>
              <Button variant="outline" size="sm" className="inline-flex rounded-xl relative z-20 transition-all duration-300 hover:bg-white/20 hover:text-white hover:border-white/30 border-white/20 bg-white/10 text-white backdrop-blur-sm">
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className={cn(
              "flex items-center space-x-2 relative z-20",
              showMobileMenu ? "flex" : "md:hidden"
            )}>
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
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out rounded-b-xl md:rounded-b-2xl relative z-20",
            showMobileMenu ? "" : "md:hidden",
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
            
            {/* Sentiment Badge */}
            <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white/90 backdrop-blur-sm relative z-20 transition-all duration-300">
              <span className="font-medium text-white/80">Sentiment:</span>
              <span className="rounded-md bg-emerald-500/30 px-2 py-0.5 text-white font-semibold backdrop-blur-sm border border-emerald-500/30">
                Positive
              </span>
            </div>
            
            {/* AI Toggle */}
            <Button
              variant={isEnabled ? "secondary" : "outline"}
              size="sm"
              className="w-full justify-start inline-flex items-center gap-2 rounded-xl relative z-20 transition-all duration-300 hover:bg-white/20 hover:text-white hover:border-white/30 border-white/20 bg-white/10 text-white backdrop-blur-sm py-3"
              onClick={() => {
                handleAgentToggle();
                setMobileMenuOpen(false);
              }}
              disabled={isTogglingAgent}
            >
              <span>AI</span>
              {isEnabled ? "Disable" : "Enable"}
            </Button>
            
            {/* Sign In */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full rounded-xl relative z-20 transition-all duration-300 hover:bg-white/20 hover:text-white hover:border-white/30 border-white/20 bg-white/10 text-white backdrop-blur-sm py-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
