import { Switch, Route } from "wouter";
import { Redirect } from "wouter";
import Landing from "@/pages/Landing";
import Domains from "@/pages/Domains";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import RTLPath from "@/pages/paths/RTLPath";
import VerificationPath from "@/pages/paths/VerificationPath";
import PhysicalDesignPath from "@/pages/paths/PhysicalDesignPath";
import AnalogPath from "@/pages/paths/AnalogPath";
import FPGAPath from "@/pages/paths/FPGAPath";
import EmbeddedPath from "@/pages/paths/EmbeddedPath";
import DFTPath from "@/pages/paths/DFTPath";
import ResearchPath from "@/pages/paths/ResearchPath";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import { useUserContext } from "@/lib/user";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated, isLoading } = useUserContext();
  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white animate-pulse font-mono">Loading...</div>
    </div>
  );
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/auth/callback" component={AuthCallback} />
          <Route path="/domains">{() => <ProtectedRoute component={Domains} />}</Route>
          <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
          <Route path="/path/rtl">{() => <ProtectedRoute component={RTLPath} />}</Route>
          <Route path="/path/verification">{() => <ProtectedRoute component={VerificationPath} />}</Route>
          <Route path="/path/physical-design">{() => <ProtectedRoute component={PhysicalDesignPath} />}</Route>
          <Route path="/path/analog">{() => <ProtectedRoute component={AnalogPath} />}</Route>
          <Route path="/path/fpga">{() => <ProtectedRoute component={FPGAPath} />}</Route>
          <Route path="/path/embedded">{() => <ProtectedRoute component={EmbeddedPath} />}</Route>
          <Route path="/path/dft">{() => <ProtectedRoute component={DFTPath} />}</Route>
          <Route path="/path/research">{() => <ProtectedRoute component={ResearchPath} />}</Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}