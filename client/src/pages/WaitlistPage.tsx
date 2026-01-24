import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import videoGif from "@assets/video-presentation.gif";
import akselerLogo from "@assets/akseler black_1762845353524.png";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);

  // Initialize Vimeo player on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (iframeRef.current && (window as any).Vimeo) {
        playerRef.current = new (window as any).Vimeo.Player(iframeRef.current);
        
        playerRef.current.ready().then(() => {
          playerReadyRef.current = true;
        });

        playerRef.current.on('fullscreenchange', (data: any) => {
          if (!data.fullscreen) {
            playerRef.current.pause();
            setShowFallbackModal(false);
          }
        });
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (showFallbackModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFallbackModal]);

  const handlePlayClick = useCallback(async () => {
    if (showFallbackModal) return;
    
    if (!playerRef.current || !playerReadyRef.current) {
      setShowFallbackModal(true);
      return;
    }

    try {
      await playerRef.current.setVolume(1);
      await playerRef.current.play();
      await playerRef.current.requestFullscreen();
    } catch (e) {
      setShowFallbackModal(true);
      
      if (playerRef.current) {
        try {
          await playerRef.current.setVolume(1);
          await playerRef.current.play();
        } catch (playError) {
          console.log('Video playback error:', playError);
        }
      }
    }
  }, [showFallbackModal]);

  const handleCloseFallback = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setShowFallbackModal(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;
    
    setIsLoading(true);
    
    // Simulate API call - replace with actual endpoint
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      // Still show success for now
      setIsSubmitted(true);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-4 py-8 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(29, 130, 99, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29, 130, 99, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1d8263]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1d8263]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main content wrapper - grows to fill space */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[#1d8263]/30 bg-[#1d8263]/5"
        >
          <Lock className="w-3.5 h-3.5 text-[#1d8263]" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#1d8263]">
            Early Access
          </span>
        </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-center mb-8 max-w-lg"
      >
        <img 
          src={akselerLogo} 
          alt="Akseler" 
          className="h-8 md:h-10 w-auto mx-auto mb-4 brightness-0 invert"
        />
        <p className="text-white/50 text-sm md:text-base font-light">
          AI pardavimų sistema paslaugų verslams
        </p>
      </motion.div>

      {/* Video Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-sm mb-12 md:mb-16"
      >
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#1d8263]/30 bg-black/50 backdrop-blur-sm">
          <div 
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              transform: 'translateZ(0)',
              WebkitMaskImage: '-webkit-radial-gradient(white, black)',
              isolation: 'isolate'
            }}
          >
            <img 
              src={videoGif} 
              alt="Video presentation" 
              className="w-full h-auto block"
              width={640}
              height={1138}
              loading="eager"
              style={{ 
                filter: 'blur(2.5px)',
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            
            <div 
              className="absolute inset-0 rounded-2xl border border-[#1d8263]/20 pointer-events-none z-10"
            />
            
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <button
                onClick={handlePlayClick}
                className="cursor-pointer w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1d8263]/80 backdrop-blur-md border-2 border-white/20 hover:bg-[#1d8263] hover:border-white/40 hover:scale-110 flex items-center justify-center transition-all duration-300 active:scale-95 shadow-2xl shadow-[#1d8263]/50"
                style={{
                  boxShadow: '0 0 60px rgba(29, 130, 99, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                }}
              >
                <svg 
                  className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
            
            <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
          </div>
        </div>
      </motion.div>

      {/* Email signup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-md px-4"
      >
        {!isSubmitted ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-white/90 text-lg md:text-xl font-semibold mb-2">
                Gaukite prieigą pirmieji
              </h3>
              <p className="text-white/50 text-sm">
                Užsiregistruokite ir sužinokite kai startuosime
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jusu@email.com"
                  required
                  className="w-full h-14 md:h-16 px-5 pr-16 rounded-xl bg-white/5 border border-white/15 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-[#1d8263]/60 focus:ring-2 focus:ring-[#1d8263]/20 focus:bg-white/10 transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-lg bg-[#1d8263] hover:bg-[#166b52] flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <div className="w-16 h-16 rounded-full bg-[#1d8263]/20 border-2 border-[#1d8263]/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#1d8263]" />
            </div>
            <div className="text-center">
              <p className="text-white/90 text-lg font-semibold mb-1">
                Ačiū už registraciją!
              </p>
              <p className="text-white/50 text-sm">
                Susisieksime netrukus
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
      </div>

      {/* Footer with logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-auto pt-12 pb-8 flex flex-col items-center gap-4"
      >
        <img 
          src={akselerLogo} 
          alt="Akseler" 
          className="h-6 w-auto brightness-0 invert opacity-60"
        />
        <span className="text-white/50 text-sm font-mono tracking-wider">
          © 2025
        </span>
      </motion.div>

      {/* Hidden iframe for pre-loading */}
      {!showFallbackModal && (
        <div 
          className="fixed"
          style={{ 
            left: '-9999px', 
            top: '-9999px', 
            width: '1px', 
            height: '1px',
            overflow: 'hidden',
            visibility: 'hidden',
            pointerEvents: 'none'
          }}
        >
          <iframe
            ref={iframeRef}
            src="https://player.vimeo.com/video/1140626708?h=58a2a7ce8b&badge=0&autopause=0&quality=1080p&player_id=0&app_id=58479"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ width: '100%', height: '100%' }}
            title="AI Pardavimų ir marketingo sistema"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Fallback Modal */}
      {showFallbackModal && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={handleCloseFallback}
        >
          <button 
            className="absolute top-4 right-4 text-white z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            onClick={handleCloseFallback}
          >
            <X className="w-6 h-6" />
          </button>
          <div 
            className="w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '56.25% 0 0 0', position: 'relative' }} className="w-full max-w-4xl">
              <iframe
                key="modal-video"
                src="https://player.vimeo.com/video/1140626708?h=58a2a7ce8b&badge=0&autopause=0&quality=1080p&autoplay=1&player_id=0&app_id=58479"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                title="AI Pardavimų ir marketingo sistema"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

