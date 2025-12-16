export default function MarketsScrolling({
  hideTitle = false,
  compact = false,
}: {
  hideTitle?: boolean;
  compact?: boolean;
}) {
  const marketsRow1 = [
    "NT paslaugos",
    "Odontologija",
    "Saulės elektrinės",
    "ŠVOK",
    "Draudimas",
    "Estetinė medicina"
  ];

  const marketsRow2 = [
    "Grožio klinikos",
    "Finansai",
    "Veterinarija",
    "Agentūros",
    "Mašinų lizingas",
    "Psichikos klinikos"
  ];

  return (
    <section
      className={`overflow-hidden ${
        compact ? "bg-transparent pt-6 md:pt-8 pb-8 md:pb-10" : "bg-[#E0F2E8] pt-16 md:pt-20 pb-20 md:pb-24"
      }`}
    >
      {!hideTitle ? (
        <div className="max-w-4xl mx-auto mb-8 md:mb-12 px-6 lg:px-12">
        {/* Mobile version */}
          <h2
            className="block md:hidden text-[24px] font-bold text-center tracking-tight"
            data-testid="text-markets-scrolling-title"
          >
          Pritaikoma įvairiose rinkose
        </h2>
        {/* Desktop version */}
          <h2
            className="hidden md:block text-[32px] lg:text-[36px] font-bold text-center tracking-tight whitespace-nowrap leading-tight"
            data-testid="text-markets-scrolling-title-desktop"
          >
          Pritaikoma įvairiose B2C rinkose
        </h2>
      </div>
      ) : null}
      <div className={`relative w-full ${compact ? "" : "max-w-5xl mx-auto"}`}>
        {/* Gradient overlays for smooth edges */}
        {!compact ? (
          <>
            <div className="absolute inset-y-0 left-0 w-32 md:w-48 lg:w-64 bg-gradient-to-r from-[#E0F2E8] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 md:w-48 lg:w-64 bg-gradient-to-l from-[#E0F2E8] to-transparent z-10 pointer-events-none"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-[#E0F2E8] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-[#E0F2E8] to-transparent z-10 pointer-events-none"></div>
          </>
        )}
        
        <div className="space-y-4 w-full">
          {/* First row - scrolling left */}
          <div className="relative w-full overflow-hidden">
            <div className="flex gap-4 animate-scroll-left w-max">
              {[...marketsRow1, ...marketsRow1, ...marketsRow1, ...marketsRow1, ...marketsRow1, ...marketsRow1].map((industry, index) => (
                <div
                  key={`row1-${index}`}
                  className="px-6 py-3 text-sm font-medium border-2 border-[#1d8263]/10 whitespace-nowrap flex-shrink-0 bg-[#E0F2E8] text-slate-900 rounded-md"
                >
                  {industry}
                </div>
              ))}
            </div>
          </div>
          {/* Second row - scrolling right */}
          <div className="relative w-full overflow-hidden">
            <div className="flex gap-4 animate-scroll-right w-max">
              {[...marketsRow2, ...marketsRow2, ...marketsRow2, ...marketsRow2, ...marketsRow2, ...marketsRow2].map((industry, index) => (
                <div
                  key={`row2-${index}`}
                  className="px-6 py-3 text-sm font-medium border-2 border-[#1d8263]/10 whitespace-nowrap flex-shrink-0 bg-[#E0F2E8] text-slate-900 rounded-md"
                >
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
