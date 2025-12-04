export default function StatsAnimated() {
  const stats = [
    {
      number: "+395",
      unit: "%",
      description: "Konversijos tikimybės padidėjimas pagal Harvard Business tyrimą, kai su nauja užklausa susisiekiama per 3 minutes.",
    },
    {
      number: "+45",
      unit: "val.",
      description: "Sutaupyta kiekvienam pardavėjui per mėnesį – pirmas kontaktas, info rinkimas ir atnaujinimas, dokumentų generavimas.",
    },
    {
      number: "+30",
      unit: "%",
      description: "Daugiau suvaldytų užklausų dėl automatinių priminimų ir sistemingo kliento sekimo. Kiekviena galimybė pilnai išnaudojama.",
    },
  ];

  return (
    <section className="py-12 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="border border-border/40 rounded-2xl p-6 md:p-8 bg-card/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index + 1}`}>
                <div className="mb-3">
                  <span className="text-4xl md:text-5xl font-bold tracking-tight">
                    {stat.number}
                  </span>
                  <span className="text-xl md:text-2xl font-medium ml-1">
                    {stat.unit}
                  </span>
                </div>
                <p className="md:text-sm text-foreground/70 text-[14px]" data-testid={`text-stat-desc-${index + 1}`}>
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
