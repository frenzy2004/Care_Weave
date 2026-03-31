import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HealthDataProvider } from "@/contexts/HealthDataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import HealthTimeline from "./pages/HealthTimeline";
import SymptomLogger from "./pages/SymptomLogger";
import MedicationTracker from "./pages/MedicationTracker";
import ProviderDirectory from "./pages/ProviderDirectory";
import VisitsLog from "./pages/VisitsLog";
import PatternDashboard from "./pages/PatternDashboard";
import HealthStory from "./pages/HealthStory";
import ExportReport from "./pages/ExportReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HealthDataProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timeline" element={<HealthTimeline />} />
              <Route path="/log-symptom" element={<SymptomLogger />} />
              <Route path="/medications" element={<MedicationTracker />} />
              <Route path="/providers" element={<ProviderDirectory />} />
              <Route path="/visits" element={<VisitsLog />} />
              <Route path="/insights" element={<PatternDashboard />} />
              <Route path="/health-story" element={<HealthStory />} />
              <Route path="/export" element={<ExportReport />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </HealthDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
