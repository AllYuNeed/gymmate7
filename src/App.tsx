import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import Landing from "./pages/Landing.tsx";
import Auth from "./pages/Auth.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Sanctum from "./pages/Sanctum.tsx";
import Forge from "./pages/Forge.tsx";
import Realms from "./pages/Realms.tsx";
import Quests from "./pages/Quests.tsx";
import Boss from "./pages/Boss.tsx";
import Diet from "./pages/Diet.tsx";
import Routines from "./pages/Routines.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/awaken" element={<Onboarding />} />
            <Route path="/sanctum" element={<Sanctum />} />
            <Route path="/forge" element={<Forge />} />
            <Route path="/realms" element={<Realms />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/boss" element={<Boss />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
