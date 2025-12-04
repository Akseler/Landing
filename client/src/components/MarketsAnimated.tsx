import { motion } from "framer-motion";

export default function MarketsAnimated() {
  const contentTypes = [
    { name: "Mythbuster", color: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400" },
    { name: "Features", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
    { name: "Us vs Them", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" },
    { name: "Testimonials", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
    { name: "Best-sellers", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400" },
    { name: "Media", color: "bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400" },
    { name: "Negative Hook", color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
    { name: "Before & After", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" },
    { name: "Top X Reasons", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
    { name: "Problem-solution", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400" },
    { name: "Statistics", color: "bg-lime-100 text-lime-600 dark:bg-lime-900/20 dark:text-lime-400" },
    { name: "Notes", color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" },
    { name: "What's Inside", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
    { name: "FAQ", color: "bg-sky-100 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400" },
  ];

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16 tracking-tight" data-testid="text-markets-title">
          Pritaikoma šiose rinkose
        </h2>
        
        <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-12 min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl">
            {contentTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.3,
                }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`${type.color} rounded-lg p-4 text-center font-medium text-sm cursor-pointer`}
                data-testid={`market-type-${index + 1}`}
              >
                {type.name}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
