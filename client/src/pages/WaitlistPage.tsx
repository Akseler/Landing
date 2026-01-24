import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import akselerLogo from "@assets/akseler black_1762845353524.png";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    
    setIsLoading(true);
    
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setIsSubmitted(true);
    } catch (error) {
      setIsSubmitted(true);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(29, 130, 99, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29, 130, 99, 1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#1d8263]/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-[#1d8263]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Logo */}
        <motion.img 
          src={akselerLogo} 
          alt="Akseler" 
          className="h-8 md:h-9 w-auto brightness-0 invert opacity-90 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Date */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-white font-semibold tracking-tight text-center mb-4"
          style={{ 
            fontSize: 'clamp(72px, 20vw, 120px)', 
            lineHeight: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
          }}
        >
          02.01
        </motion.h1>
        
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#1d8263] text-sm font-medium tracking-[0.2em] uppercase mb-12"
        >
          Jau netrukus
        </motion.p>

        {/* Email signup */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="El. paštas"
                  required
                  className="flex-1 h-12 px-4 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white text-[15px] placeholder:text-white/40 focus:outline-none focus:border-[#1d8263]/50 focus:bg-white/[0.1] transition-all"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-5 rounded-xl bg-[#1d8263] hover:bg-[#229570] text-white text-[15px] font-medium flex items-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Priminti</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 h-12 text-white/70">
              <Check className="w-5 h-5 text-[#1d8263]" />
              <span className="text-[15px]">Priminsime!</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
