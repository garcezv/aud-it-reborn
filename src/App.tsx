import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtocolSetupPage from "./pages/ProtocolSetupPage";
import PracticePage from "./pages/PracticePage";
import CalibrationPage from "./pages/CalibrationPage";
import AdultInstructionPage from "./pages/AdultInstructionPage";
import ChildrenInstructionPage from "./pages/ChildrenInstructionPage";
import AdultTestPage from "./pages/AdultTestPage";
import ChildrenTestPage from "./pages/ChildrenTestPage";
import EarSwitchPage from "./pages/EarSwitchPage";
import ResultsPage from "./pages/ResultsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/protocol" element={<ProtocolSetupPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/calibration" element={<CalibrationPage />} />
          <Route path="/instruction/adult" element={<AdultInstructionPage />} />
          <Route path="/instruction/children" element={<ChildrenInstructionPage />} />
          <Route path="/test/adult" element={<AdultTestPage />} />
          <Route path="/test/children" element={<ChildrenTestPage />} />
          <Route path="/ear-switch" element={<EarSwitchPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
