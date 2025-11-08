import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Plans from "./pages/Plans";
import Coverage from "./pages/Coverage";
import Devices from "./pages/Devices";
import NetworkStatus from "./pages/NetworkStatus";
import Help from "./pages/Help";
import Assist from "./pages/Assist";
import Tickets from "./pages/Tickets";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/status" element={<NetworkStatus />} />
          <Route path="/help" element={<Help />} />
          <Route path="/assist" element={<Assist />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
