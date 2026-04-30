// AFTER
import HeroBanner from "@/components/HeroBanner";
import CircuitBackground from "@/components/CircuitBackground";
import ParticleCanvas from "@/components/ParticleCanvas";
import FloatingParticles from "@/components/FloatingParticles";
import { useLocation } from "wouter";
import { useUserContext } from "@/lib/user";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useUserContext();

  const handleStart = () => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    setLocation("/dashboard");
  };

  const handleExplore = () => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    setLocation("/domains");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pt-16">
      <CircuitBackground />
      <ParticleCanvas color="#3b82f6" density={40} />
      <FloatingParticles count={15} />
      
      <HeroBanner onStart={handleStart} onExplore={handleExplore} />

      <section className="py-24 px-4 border-t border-white/10 bg-black/50 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-['Orbitron'] mb-6">
              Industry-Grade Learning
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Skip the academic fluff. Learn the exact skills, tools, and methodologies used by top semiconductor companies.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "8 Specialized Domains", desc: "From RTL to Physical Design, Analog to DFT. Choose your specialized path." },
              { title: "Gamified Progress", desc: "Earn XP, rank up from Learner to Architect, and build a competitive portfolio." },
              { title: "Real-World Labs", desc: "Work on UARTs, PLLs, UVM testbenches, and complete mini-processors." },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                  <div className="w-6 h-6 bg-blue-500 rounded-full blur-[2px]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 font-['Orbitron']">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
