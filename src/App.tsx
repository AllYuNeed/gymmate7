import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import Landing from "./pages/Landing.tsx";
import Auth from "./pages/Auth.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Friends from "./pages/Friends.tsx";
import Messages from "./pages/Messages.tsx";
import MessageThread from "./pages/MessageThread.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Sanctum from "./pages/Sanctum.tsx";
import Forge from "./pages/Forge.tsx";
import Realms from "./pages/Realms.tsx";
import Quests from "./pages/Quests.tsx";
import Boss from "./pages/Boss.tsx";
import Diet from "./pages/Diet.tsx";
import Routines from "./pages/Routines.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import Guilds from "./pages/Guilds.tsx";
import GuildDetail from "./pages/GuildDetail.tsx";
import PlanBuilder from "./pages/PlanBuilder.tsx";
import NotFound from "./pages/NotFound.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import DataSafety from "./pages/DataSafety.tsx";
import GymJourney from "./pages/GymJourney.tsx";

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
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:id" element={<MessageThread />} />
            <Route path="/awaken" element={<Onboarding />} />
            <Route path="/sanctum" element={<Sanctum />} />
            <Route path="/forge" element={<Forge />} />
            <Route path="/realms" element={<Realms />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/boss" element={<Boss />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/guilds" element={<Guilds />} />
            <Route path="/guilds/:id" element={<GuildDetail />} />
            <Route path="/plan-builder" element={<PlanBuilder />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/data-safety" element={<DataSafety />} />
            <Route path="/gym-journey" element={<GymJourney />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
