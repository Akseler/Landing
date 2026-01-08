export default function StatsSection() {
  const stats = [
    {
      value: "15+ val.",
      label: "Sugaišta kiekvienas pardavėjas per savaitę administruodamas pokalbius ir pardavinėdamas užklausas, o ne pardinėdamas",
    },
    {
      value: "30%",
      label: "Užklausų lieka be atsakymo arba pasimiršta. Tai lemia prarastas pajamas ir nuostytius klientus.",
    },
    {
      value: "24+ val.",
      label: "Klientas laukia pirmo atsakymo arba tai laiką klientas parą ar ligiau. Per šį laiką klientas spėja pasikelikriti ir konkurentus.",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center" data-testid={`stat-${index + 1}`}>
              <div className="mb-4">
                <h3 className="text-4xl lg:text-5xl font-bold tracking-tight" data-testid={`text-stat-value-${index + 1}`}>
                  {stat.value}
                </h3>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed" data-testid={`text-stat-label-${index + 1}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
