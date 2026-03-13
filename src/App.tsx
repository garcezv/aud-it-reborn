import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuditProvider } from "@/context/AuditContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtocolSetupPage from "./pages/ProtocolSetupPage";
import TestPage from "./pages/TestPage";
import CalibrationPage from "./pages/CalibrationPage";
import ResultsPage from "./pages/ResultsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuditProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/protocol" element={<ProtocolSetupPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/calibration" element={<CalibrationPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuditProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
