import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AgenticProvider } from "@/contexts/AgenticContext";
import { FloatingAssistant } from "@/components/FloatingAssistant";
import Home from "./pages/Home";
import Plans from "./pages/Plans";
import Devices from "./pages/Devices";
import NetworkStatus from "./pages/NetworkStatus";
import Help from "./pages/Help";
import Assist from "./pages/Assist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/status" element={<NetworkStatus />} />
        <Route path="/help" element={<Help />} />
        <Route path="/assist" element={<Assist />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isHomePage && <FloatingAssistant />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AgenticProvider>
          <AppContent />
        </AgenticProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
