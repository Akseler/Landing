import veeslaLogo from "@assets/3_1761686356688.png";
import specdarbaiLogo from "@assets/2_1761686356688.png";
import energija24Logo from "@assets/energija transparent.png";

export default function TrustSection() {
  return (
    <section className="py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12" data-testid="text-trust-title">
          Mumis pasitiki dideli žaidėjai
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="border border-border rounded-xl p-8 flex items-center justify-center bg-background" data-testid="card-partner-1">
            <img src={veeslaLogo} alt="VEESLA" className="h-16 w-auto object-contain" />
          </div>
          
          <div className="border border-border rounded-xl p-8 flex items-center justify-center bg-background" data-testid="card-partner-2">
            <img src={specdarbaiLogo} alt="SPECDARBAI" className="h-16 w-auto object-contain" />
          </div>
          
          <div className="border border-border rounded-xl p-8 flex items-center justify-center bg-background" data-testid="card-partner-3">
            <img src={energija24Logo} alt="energija24" className="h-16 w-auto object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}
