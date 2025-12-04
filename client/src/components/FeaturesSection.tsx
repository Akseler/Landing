export default function FeaturesSection() {
  const features = [
    {
      emoji: "🧠",
      title: "Prisitaiko prie su jūsų verslo procesų",
      description: "Veikia pagal jūsų taisykles ir kvalifikacijos logiką.",
    },
    {
      emoji: "🔧",
      title: "Susijungia su jūsų įrankiais",
      description: "Integruojasi su CRM'ais, El.paštu, telefonija ir soc. medija",
    },
    {
      emoji: "🔐",
      title: "Duomenys saugūs",
      description: "Visa sukaupta informacija priklauso tik jums. BDAR compliant baby.",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="border border-border rounded-xl p-8 bg-background"
            data-testid={`feature-${index + 1}`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">{feature.emoji}</span>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" data-testid={`text-feature-title-${index + 1}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground italic" data-testid={`text-feature-desc-${index + 1}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
