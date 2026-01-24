import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
    <div 
      className="h-screen w-screen bg-[#0a0a0a] flex flex-col items-center justify-center fixed inset-0 overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Animated grain background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          animation: 'grain 0.3s steps(2) infinite',
        }}
      />

      {/* CSS animation for grain movement */}
      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2%, -2%); }
          50% { transform: translate(2%, 2%); }
          75% { transform: translate(-2%, 2%); }
        }
      `}</style>

      {/* Subtle green glow in center */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(29,130,99,0.12) 0%, rgba(29,130,99,0.03) 50%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center" style={{ gap: '50px' }}>
        {/* Logo */}
        <motion.img 
          src={akselerLogo} 
          alt="Akseler" 
          className="w-auto brightness-0 invert"
          style={{ height: '28px' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col items-center"
          style={{ gap: '25px' }}
        >
          <h1 
            className="text-white font-semibold tracking-tight"
            style={{ fontSize: 'clamp(72px, 15vw, 120px)', lineHeight: 1, letterSpacing: '-0.03em' }}
          >
            02.01
          </h1>
          
          {/* Label */}
          <span 
            className="text-[#1d8263] font-medium uppercase"
            style={{ fontSize: '13px', letterSpacing: '0.2em' }}
          >
            Jau netrukus
          </span>
        </motion.div>

        {/* Email signup */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ width: '300px' }}
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="El. paštas"
                  required
                  className="w-full px-4 pr-12 rounded-xl bg-white/[0.03] border border-white/[0.12] text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all"
                  style={{ height: '50px', fontSize: '15px' }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#1d8263] hover:bg-[#228f6c] flex items-center justify-center transition-all disabled:opacity-50"
                  style={{ width: '36px', height: '36px' }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2" style={{ height: '50px' }}>
              <CheckCircle2 className="w-5 h-5 text-[#1d8263]" />
              <span className="text-white/60" style={{ fontSize: '15px' }}>Ačiū!</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
