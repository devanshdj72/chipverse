import { Switch, Route, Router as WouterRouter } from "wouter";
import DomainReport from './pages/DomainReport';
import Profile from "@/pages/Profile";
import Landing from "@/pages/Landing";
import Domains from "@/pages/Domains";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Leaderboard from "@/pages/Leaderboard";
import BattleField from "@/pages/BattleField";
import BattleRoom from "@/pages/BattleRoom";
import RTLPath from "@/pages/paths/RTLPath";
import PhysicalDesignPath from "@/pages/paths/PhysicalDesignPath";
import AnalogPath from "@/pages/paths/AnalogPath";
import FPGAPath from "@/pages/paths/FPGAPath";
import EmbeddedPath from "@/pages/paths/EmbeddedPath";
import DFTPath from "@/pages/paths/DFTPath";
import ResearchPath from "@/pages/paths/ResearchPath";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import Achievements from "@/pages/Achievements";
import Placement from "@/pages/Placement";
import Messages from "@/pages/Messages";
import AIAssistant from "@/components/AIAssistant";
import VerificationPath from "@/pages/paths/VerificationPath";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminResources from "@/pages/admin/AdminResources";

const isAdminRoute = () => window.location.pathname.startsWith("/admin");

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      {!isAdminRoute() && <Navbar />}
      <main className="min-h-screen bg-black">
        <Switch>
          <Route path="/"                      component={Landing} />
          <Route path="/domains"               component={Domains} />
          <Route path="/dashboard"             component={Dashboard} />
          <Route path="/login"                 component={Login} />
          <Route path="/auth/callback"         component={AuthCallback} />
          <Route path="/leaderboard"           component={Leaderboard} />
          <Route path="/battlefield"           component={BattleField} />
          <Route path="/battle/:battleId"      component={BattleRoom} />
          <Route path="/path/rtl"              component={RTLPath} />
          <Route path="/path/verification"     component={VerificationPath} />
          <Route path="/path/physical-design"  component={PhysicalDesignPath} />
          <Route path="/path/analog"           component={AnalogPath} />
          <Route path="/path/fpga"             component={FPGAPath} />
          <Route path="/path/embedded"         component={EmbeddedPath} />
          <Route path="/path/dft"              component={DFTPath} />
          <Route path="/path/research"         component={ResearchPath} />

          {/* ── NEW: Domain Skill Reports ── */}
          <Route path="/report/share/:shareToken" component={DomainReport} />
          <Route path="/report/:domainId"         component={DomainReport} />

          <Route path="/achievements"          component={Achievements} />
          <Route path="/placement"             component={Placement} />
          <Route path="/profile"               component={Profile} />
          <Route path="/messages"              component={Messages} />

          {/* Admin Panel */}
          <Route path="/admin/login"           component={AdminLogin} />
          <Route path="/admin/dashboard"       component={AdminDashboard} />
          <Route path="/admin/resources"       component={AdminResources} />

          <Route component={NotFound} />
        </Switch>
      </main>
      {!isAdminRoute() && <AIAssistant />}
    </WouterRouter>
  );
}