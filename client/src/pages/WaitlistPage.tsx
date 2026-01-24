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
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Grid background - full */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(29, 130, 99, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29, 130, 99, 1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: 'center center'
          }}
        />
        {/* Radial fade from center */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 50%, transparent 0%, #050505 70%)'
          }}
        />
      </div>

      {/* Subtle glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#1d8263]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        {/* Logo */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src={akselerLogo} 
            alt="Akseler" 
            className="h-9 md:h-10 w-auto brightness-0 invert opacity-80"
          />
        </motion.div>
        
        {/* Date - aligned to grid aesthetic */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative mb-4"
        >
          {/* Horizontal accent lines through date */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] flex items-center justify-between pointer-events-none">
            <div className="w-8 h-px bg-[#1d8263]/40" />
            <div className="w-8 h-px bg-[#1d8263]/40" />
          </div>
          
          <h1
            className="text-white font-semibold tracking-tight text-center relative"
            style={{ 
              fontSize: 'clamp(90px, 25vw, 150px)', 
              lineHeight: 0.9,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
            }}
          >
            02.01
          </h1>
        </motion.div>
        
        {/* Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#1d8263] text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-12"
        >
          Jau netrukus
        </motion.p>

        {/* Email signup - box with grid-like border */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-sm"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div 
                className="relative flex items-center h-14 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(29,130,99,0.1) 0%, rgba(29,130,99,0.05) 100%)',
                  border: '1px solid rgba(29,130,99,0.25)'
                }}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#1d8263]/50" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#1d8263]/50" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#1d8263]/50" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#1d8263]/50" />
                
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="El. paštas"
                  required
                  className="flex-1 h-full px-5 bg-transparent text-white text-[15px] placeholder:text-white/30 focus:outline-none"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-9 px-4 mr-2.5 rounded-lg bg-[#1d8263] hover:bg-[#229570] text-white text-[13px] font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-[0.98]"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Priminti</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div 
              className="flex items-center justify-center gap-2 h-14 rounded-xl text-white/70"
              style={{
                background: 'linear-gradient(135deg, rgba(29,130,99,0.1) 0%, rgba(29,130,99,0.05) 100%)',
                border: '1px solid rgba(29,130,99,0.25)'
              }}
            >
              <Check className="w-5 h-5 text-[#1d8263]" />
              <span className="text-[15px]">Priminsime!</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
