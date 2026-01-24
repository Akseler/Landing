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
    <div className="fixed inset-0 w-screen h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -15px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 10px); }
        }
      `}</style>

      {/* Grid background - full screen */}
      <div className="fixed inset-0 w-full h-full opacity-[0.06]">
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(29, 130, 99, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29, 130, 99, 1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        {/* Center fade */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, #0a0a0a 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Animated glowing orbs */}
      <div 
        className="fixed top-1/2 left-1/2 w-[80vw] h-[60vh] max-w-[700px] max-h-[500px] bg-[#1d8263] rounded-full blur-[100px] md:blur-[120px] pointer-events-none"
        style={{ animation: 'pulse-glow 8s ease-in-out infinite' }}
      />
      
      {/* Floating accent orbs */}
      <div 
        className="fixed top-1/4 right-1/4 w-32 h-32 md:w-48 md:h-48 bg-[#1d8263]/20 rounded-full blur-[60px] pointer-events-none"
        style={{ animation: 'float-1 12s ease-in-out infinite' }}
      />
      <div 
        className="fixed bottom-1/4 left-1/4 w-24 h-24 md:w-40 md:h-40 bg-[#1d8263]/15 rounded-full blur-[50px] pointer-events-none"
        style={{ animation: 'float-2 10s ease-in-out infinite' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        {/* Logo */}
        <motion.img 
          src={akselerLogo} 
          alt="Akseler" 
          className="h-10 md:h-12 w-auto brightness-0 invert opacity-90 mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Date + Label - 3 lines centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-14"
        >
          <h1
            className="text-white font-semibold tracking-tight mb-3 text-8xl md:text-9xl lg:text-[10rem]"
            style={{ 
              lineHeight: 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif'
            }}
          >
            02.01
          </h1>
          <p className="text-[#1d8263] text-sm md:text-base font-medium tracking-[0.25em] uppercase">
            Jau netrukus
          </p>
        </motion.div>

        {/* Email signup */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-xs"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center h-12 pl-4 pr-1.5 rounded-full bg-white/[0.08] border border-white/[0.15]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="El. paštas"
                  required
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 focus:outline-none"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-9 px-4 rounded-full bg-[#1d8263] hover:bg-[#229570] text-white text-sm font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
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
            <div className="flex items-center justify-center gap-2 h-12 rounded-full bg-white/[0.08] border border-white/[0.15] text-white/70">
              <Check className="w-4 h-4 text-[#1d8263]" />
              <span className="text-sm">Priminsime!</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
