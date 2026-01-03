import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { SettingsProvider } from "@/context/SettingsContext";
import MobileNav from "@/components/layout/MobileNav";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="relative min-h-screen">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/services" element={<Services />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileNav />
            </div>
          </BrowserRouter>
        </DataProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
