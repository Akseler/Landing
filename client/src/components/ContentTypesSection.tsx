export default function ContentTypesSection() {
  const contentTypes = [
    { name: "Mythbuster", color: "text-pink-500" },
    { name: "Features", color: "text-pink-400" },
    { name: "Us vs Them", color: "text-pink-400" },
    { name: "Testimonials", color: "text-pink-400" },
    { name: "Best-sellers", color: "text-blue-500" },
    { name: "Media", color: "text-pink-400" },
    { name: "Negative Hook", color: "text-red-500" },
    { name: "Before & After", color: "text-pink-400" },
    { name: "Top X Reasons", color: "text-pink-400" },
    { name: "Problem-solution", color: "text-orange-500" },
    { name: "Statistics", color: "text-blue-500" },
    { name: "Notes", color: "text-blue-500" },
    { name: "What's Inside", color: "text-pink-400" },
    { name: "FAQ", color: "text-blue-500" },
  ];

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16 tracking-tight" data-testid="text-markets-title">
          AI darbuotojai pritaikomi šiose rinkose
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {contentTypes.slice(0, 7).map((type, index) => (
            <div 
              key={index}
              className="border border-border rounded-lg p-4 text-center bg-background"
              data-testid={`content-type-${index + 1}`}
            >
              <span className={`text-sm font-medium ${type.color}`}>{type.name}</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {contentTypes.slice(7).map((type, index) => (
            <div 
              key={index + 7}
              className="border border-border rounded-lg p-4 text-center bg-background"
              data-testid={`content-type-${index + 8}`}
            >
              <span className={`text-sm font-medium ${type.color}`}>{type.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
