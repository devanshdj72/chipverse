import { DOMAIN_LIST } from "@/lib/data";
import DomainCard from "@/components/DomainCard";
import CircuitBackground from "@/components/CircuitBackground";

export default function Domains() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 relative bg-black">
      <CircuitBackground />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-['Orbitron']">
            Choose Your Path
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The semiconductor industry has many specialized roles. Select a domain to start your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DOMAIN_LIST.map(domain => (
            <DomainCard key={domain.id} domain={domain} />
          ))}
        </div>
      </div>
    </div>
  );
}
