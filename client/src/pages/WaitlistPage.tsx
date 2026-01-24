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
      className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Grid background - aligned */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(29, 130, 99, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29, 130, 99, 1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            backgroundPosition: 'center center'
          }}
        />
        {/* Center fade - makes grid less visible in the middle */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(10,10,10,1) 0%, rgba(10,10,10,1) 30%, rgba(10,10,10,0.8) 50%, rgba(10,10,10,0) 70%)'
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#1d8263]/25 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-[#1d8263]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main content - centered in grid */}
      <div className="relative flex flex-col items-center" style={{ gap: '50px' }}>
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
          className="relative flex flex-col items-center"
          style={{ gap: '25px' }}
        >
          {/* Glow */}
          <div className="absolute inset-0 blur-3xl bg-[#1d8263]/20 scale-150" />
          
          <h1 
            className="relative text-white font-semibold tracking-tight"
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
