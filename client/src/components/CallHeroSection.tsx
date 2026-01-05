import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Play, X } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import veeslaLogo from "@assets/3_1761686356688.png";
import specdarbaiLogo from "@assets/2_1761686356688.png";
import energija24Logo from "@assets/energija transparent.png";
import videoThumbnail from "@assets/thumb_1764295191794.webp";
import videoGif from "@assets/video-presentation.gif";
import { trackEvent } from "@/lib/analytics";

export default function CallHeroSection() {
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);
  const trustSectionRef = useRef<HTMLDivElement>(null);

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

        // Listen for fullscreen exit to pause and cleanup
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

  // Handle fallback modal body scroll
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

  // Handle scroll detection for "Mumis pasitiki" section (both mobile and desktop)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 30) { // Show after scrolling 30px (faster on mobile)
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle play button click - try fullscreen immediately
  const handlePlayClick = useCallback(async () => {
    // Track video play event
    trackEvent('video_play', window.location.pathname, 'hero_video');
    
    if (!playerRef.current || !playerReadyRef.current) {
      // Player not ready, show fallback modal
      setShowFallbackModal(true);
      return;
    }

    try {
      // Set volume and play immediately in the click handler
      await playerRef.current.setVolume(1);
      await playerRef.current.play();
      
      // Request fullscreen immediately - this must be in the same user gesture
      await playerRef.current.requestFullscreen();
    } catch (e) {
      console.log('Fullscreen not available, using fallback modal:', e);
      // Fullscreen failed (iOS/Safari), show fallback modal
      setShowFallbackModal(true);
      
      // Try to play in modal
      try {
        await playerRef.current.setVolume(1);
        await playerRef.current.play();
      } catch (playError) {
        console.log('Video playback error:', playError);
      }
    }
  }, []);

  const handleCloseFallback = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setShowFallbackModal(false);
  }, []);

  return (
    <>
    <section className="min-h-screen flex items-start md:items-center justify-center px-3 md:px-6 lg:px-12 pt-[120px] pb-6 md:pt-[95px] md:pb-12">
      <div className="max-w-4xl mx-auto text-center">
        <div className="max-w-2xl mx-auto mb-4 md:mb-5">
          <div className="inline-block mb-6 md:mb-5">
            <Badge 
              variant="outline" 
              className="px-6 py-2 text-sm font-semibold border-2 border-[#1d8263]/30 bg-[#1d8263]/5 text-[#1d8263] uppercase"
            >
              Aukštos vertės paslaugų teikėjai
            </Badge>
          </div>
          
          <h1 className="font-bold tracking-tight mb-6 md:mb-4 leading-tight" data-testid="text-hero-title">
            <span className="text-[21px] md:text-[28px] lg:text-[30px]">Padidinsime Jūsų pardavimus su</span><br />
            <span className="text-[23px] md:text-[32px] lg:text-[34px] text-[#1d8263] md:bg-gradient-to-r md:from-[#1d8263] md:via-[#05785c] md:to-[#1d8263] md:bg-clip-text md:text-transparent md:animate-gradient">
              Dirbtinio Intelekto Darbuotojais
            </span><br />
            <span className="text-[21px] md:text-[28px] lg:text-[30px]">ir sutaupysime šimtus valandų</span>
          </h1>
        </div>

        <div className="relative max-w-md mx-auto mb-6 md:mb-5 px-2 md:px-0">
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
            onClick={handlePlayClick}
            data-testid="button-play-video"
          >
            <img 
              src={videoGif} 
              alt="Video presentation" 
              className="w-full h-auto blur-sm"
              style={{ filter: 'blur(4px)' }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform z-10 animate-pulse-glow">
                <Play className="w-8 h-8 md:w-10 md:h-10 text-[#1d8263] ml-1" fill="#1d8263" />
              </div>
            </div>
          </div>
        </div>

        {/* Hidden iframe for pre-loading - positioned off-screen */}
        <div 
          className="fixed"
          style={{ 
            left: '-9999px', 
            top: '-9999px', 
            width: '1px', 
            height: '1px',
            overflow: 'hidden',
            visibility: showFallbackModal ? 'hidden' : 'visible'
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

        {/* Fallback Modal - only shown when native fullscreen fails */}
        {showFallbackModal && (
          <div 
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={handleCloseFallback}
          >
            <button 
              className="absolute top-4 right-4 text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              onClick={handleCloseFallback}
              data-testid="button-close-video"
            >
              <X className="w-8 h-8" />
            </button>
            <div 
              className="w-full h-full flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '56.25% 0 0 0', position: 'relative' }} className="w-full max-w-4xl">
                <iframe
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

        <div className="flex justify-center mt-6 mb-6 md:mt-4 md:mb-0">
          <Link href="/survey">
            <Button 
              size="lg" 
              variant="default"
              className="px-12 py-3 h-auto btn-gradient hover:opacity-95 border-0 min-w-[320px] md:min-w-[400px]"
              data-testid="button-survey"
              onClick={() => trackEvent('button_click', window.location.pathname, 'button-survey')}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg md:text-xl font-semibold">Kokių rezultatų galiu tikėtis?</span>
                <span className="text-xs opacity-80 flex items-center gap-1.5">
                  <ClipboardList className="w-3 h-3" />
                  Atsakykite į 4 klausimus ir sužinokite
                </span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Mobile: "Mumis pasitiki" after CTA button */}
        <div ref={trustSectionRef} className={`md:hidden mt-12 mb-12 transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-0'} ${hasScrolled ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-foreground/20"></div>
            <p className="text-sm text-foreground/60 font-medium">Mumis pasitiki dideli žaidėjai</p>
            <div className="h-px w-16 bg-foreground/20"></div>
          </div>
          
          <div className="opacity-60">
            <div className="logo-marquee logo-marquee--3">
              <img src={specdarbaiLogo} alt="SPECDARBAI" className="logo-marquee__item h-20 max-w-[200px] w-auto object-contain grayscale" data-testid="logo-specdarbai" />
              <img src={veeslaLogo} alt="VEESLA" className="logo-marquee__item h-20 max-w-[200px] w-auto object-contain grayscale" data-testid="logo-veesla" />
              <img src={energija24Logo} alt="energija24" className="logo-marquee__item h-20 max-w-[200px] w-auto object-contain grayscale" data-testid="logo-energija24" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Desktop: "Mumis pasitiki" section - appears after scroll */}
    <section ref={trustSectionRef} className={`hidden md:block py-12 px-6 lg:px-12 transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-0'} ${hasScrolled ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className="max-w-2xl lg:max-w-2xl mx-auto text-center">
        <p className="text-base text-foreground/60 font-medium mb-4">Mumis pasitiki dideli žaidėjai</p>
        <div className="flex justify-center items-center gap-8 opacity-60">
          <img src={specdarbaiLogo} alt="SPECDARBAI" className="h-12 max-w-[150px] w-auto object-contain grayscale" data-testid="logo-specdarbai-desktop" />
            <span className="text-foreground/40 text-2xl">|</span>
          <img src={veeslaLogo} alt="VEESLA" className="h-12 max-w-[150px] w-auto object-contain grayscale" data-testid="logo-veesla-desktop" />
            <span className="text-foreground/40 text-2xl">|</span>
          <img src={energija24Logo} alt="energija24" className="h-12 max-w-[150px] w-auto object-contain grayscale" data-testid="logo-energija24-desktop" />
        </div>
      </div>
    </section>
    </>
  );
}
