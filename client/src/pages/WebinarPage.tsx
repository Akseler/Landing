import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import WebinarStickyHeader from "@/components/webinar/WebinarStickyHeader";
import Footer from "@/components/Footer";
import { 
  Zap, Target, Link2, CheckCircle2, Calendar, Gift, Mail, Video,
  Globe, Search, Users, Mail as MailIcon, Facebook, Phone, Instagram, Database,
  Percent, Euro, Users2, Clock
} from "lucide-react";
import { trackPageView, trackButtonClick, initScrollTracking, initSessionDurationTracking } from "@/lib/analytics";
import energijaLogo from "@assets/logo_1762722223056.png";
import veeslaLogo from "@assets/2_1762722139439.png";
import specdarbaiLogo from "@assets/3_1762722139439.png";
import akselerLogo from "@assets/akseler black_1762708092193.png";

export default function WebinarPage() {
  useEffect(() => {
    document.title = "Registracija";
    trackPageView('/webinar');
    initScrollTracking();
    initSessionDurationTracking();
  }, []);
  const industriesRow1 = [
    "NT paslaugos",
    "Odontologija",
    "Saulės elektrinės",
    "ŠVOK",
    "Draudimas",
    "Estetinė medicina"
  ];

  const industriesRow2 = [
    "Grožio klinikos",
    "Finansai",
    "Veterinarija",
    "Agentūros",
    "Mašinų lizingas",
    "Psichikos klinikos"
  ];

  const icons = [
    { Icon: Globe, label: "WEB" },
    { Icon: Facebook, label: "FB" },
    { Icon: MailIcon, label: "EMAILS" },
    { Icon: Phone, label: "CALLS" },
    { Icon: Instagram, label: "IG" },
    { label: "CRM", isText: true }
  ];

  return (
    <div className="min-h-screen">
      <WebinarStickyHeader />
      <main className="pb-24">
        {/* Hero Section */}
        <section className="pb-12 px-6 lg:px-12">
          <div className="max-w-4xl md:max-w-3xl mx-auto -mt-2 md:-mt-4 relative z-40">
            <Card className="border-2">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-12">
                  <div className="mb-4 flex justify-center">
                    <img src={akselerLogo} alt="AKSELER" className="h-10 md:h-12" data-testid="logo-hero" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[26px] xl:text-[28px] font-bold mb-4 tracking-tight leading-tight" data-testid="text-hero-title">
                    Jūsų pardavimų komandos pastiprinimas su AI
                  </h1>
                  
                  <p className="text-sm sm:text-base md:text-lg lg:text-[17px] xl:text-[18px] text-foreground/70 mb-6 leading-relaxed lg:leading-snug" data-testid="text-hero-subtitle">
                    Daugiau pardavimų, mažesnės išlaidos ir prognozuojamas augimas
                  </p>
                </div>
                
                <div className="relative w-full max-w-md lg:max-w-xl mx-auto h-72 lg:h-96 mb-6">
                  {/* Container for everything */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Static circular orbit line - separate layer */}
                    <div className="absolute w-72 h-72 lg:w-96 lg:h-96 flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
                      <svg className="absolute w-full h-full">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="40%"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-[#1d8263]/30"
                        />
                      </svg>
                    </div>
                    
                    {/* Center AI Komanda */}
                    <div className="absolute w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-[#1d8263] flex items-center justify-center shadow-xl border-4 border-white" style={{ zIndex: 20 }}>
                      <span className="text-sm lg:text-base font-bold text-white text-center leading-tight">AI<br/>Komanda</span>
                    </div>
                    
                    {/* Orbiting icons container */}
                    <div className="absolute w-72 h-72 lg:w-96 lg:h-96 animate-spin-slow" style={{ animationDuration: '60s', zIndex: 10 }}>
                      {icons.map((icon, i) => {
                        const angle = (i * 60 * Math.PI) / 180;
                        const radius = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 155 : 115;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        
                        return (
                          <div
                            key={i}
                            className="absolute"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            }}
                          >
                            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-background border-2 border-[#1d8263]/40 flex items-center justify-center shadow-lg animate-counter-spin">
                              {icon.isText ? (
                                <span className="text-[10px] lg:text-xs font-bold text-[#1d8263]">{icon.label}</span>
                              ) : icon.Icon ? (
                                <icon.Icon className="w-5 h-5 lg:w-6 lg:h-6 text-[#1d8263]" />
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex gap-4 justify-center flex-wrap mb-8">
                    <Badge variant="outline" className="px-6 py-3 text-base border-2 flex-1 min-w-[200px] max-w-[280px] justify-center">Gruodžio 10d., 11:00val.</Badge>
                    <Badge variant="outline" className="px-6 py-3 text-base border-2 flex-1 min-w-[200px] max-w-[280px] justify-center">
                      Internetu, Lietuvių kalba
                    </Badge>
                  </div>

                  <div className="mb-6 text-center">
                    <p className="text-sm text-foreground/60">Mumis pasitiki rinkos lyderiai</p>
                  </div>

                  <div className="flex gap-2 md:gap-4 justify-center items-center">
                    <img 
                      src={energijaLogo} 
                      alt="Energija24 logo" 
                      className="h-6 md:h-10 object-contain max-w-[80px] md:max-w-none" 
                      data-testid="logo-energija24"
                    />
                    <span className="text-foreground/30 text-xl md:text-2xl">|</span>
                    <img 
                      src={veeslaLogo} 
                      alt="Veesla logo" 
                      className="h-6 md:h-10 object-contain max-w-[80px] md:max-w-none" 
                      data-testid="logo-veesla"
                    />
                    <span className="text-foreground/30 text-xl md:text-2xl">|</span>
                    <img 
                      src={specdarbaiLogo} 
                      alt="Specdarbai logo" 
                      className="h-6 md:h-10 object-contain max-w-[90px] md:max-w-none" 
                      data-testid="logo-specdarbai"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="/quiz" onClick={() => trackButtonClick('button-register-1', '/webinar')}>
              <Button
                size="lg"
                variant="default"
                className="px-12 py-3 h-auto bg-[#1d8263] hover:bg-[#1d8263]/90 border-0 min-w-[320px] md:min-w-[400px]"
                data-testid="button-register-1"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg md:text-xl font-semibold">Registruotis</span>
                  <span className="text-xs opacity-80 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Nemokamų vietų kiekis ribotas
                  </span>
                </div>
              </Button>
            </Link>
          </div>
        </section>

        {/* Vebinaro metu sužinosite */}
        <section className="py-12 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8 md:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8" data-testid="text-benefits-title">
                  Vebinaro metu sužinosite
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <Zap className="w-6 h-6 text-[#1d8263] flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg leading-relaxed">
                      Kaip šiandien greitis laimi prieš konkurentus.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <Target className="w-6 h-6 text-[#1d8263] flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg leading-relaxed">
                      Kaip automatinis klientų kvalifikavimas padidina pardavimų efektyvumą.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <Link2 className="w-6 h-6 text-[#1d8263] flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg leading-relaxed">
                      Kaip AI darbuotojai integruojasi prie Jūsų dabartinių procesų.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <CheckCircle2 className="w-6 h-6 text-[#1d8263] flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg leading-relaxed">
                      Kaip viskas atrodo praktikoje ir parodysime realius pavyzdžius.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <Calendar className="w-6 h-6 text-[#1d8263] flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg leading-relaxed">
                      Kaip atrodo 60 dienų veiksmų planas.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="flex gap-4 items-start">
                      <Gift className="w-6 h-6 text-[#1d8263] flex-shrink-0 mt-1" />
                      <p className="text-base md:text-lg leading-relaxed font-medium">
                        + atsakysime į jūsų klausimus
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pritaikoma įvairiose rinkose */}
        <section className="py-12 px-6 lg:px-12">
          <div className="max-w-6xl md:max-w-3xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8" data-testid="text-industries-title">
                  Pritaikoma įvairiose B2C rinkose
                </h2>
                <div className="space-y-4 overflow-hidden">
                  {/* First row - scrolling left */}
                  <div className="relative flex">
                    <div className="flex gap-4 animate-scroll-left">
                      {[...industriesRow1, ...industriesRow1, ...industriesRow1, ...industriesRow1].map((industry, index) => (
                        <Badge
                          key={`row1-${index}`}
                          variant="outline"
                          className="px-6 py-3 text-sm font-medium border-2 whitespace-nowrap flex-shrink-0 bg-[#1d8263]/10"
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Second row - scrolling right */}
                  <div className="relative flex">
                    <div className="flex gap-4 animate-scroll-right">
                      {[...industriesRow2, ...industriesRow2, ...industriesRow2, ...industriesRow2].map((industry, index) => (
                        <Badge
                          key={`row2-${index}`}
                          variant="outline"
                          className="px-6 py-3 text-sm font-medium border-2 whitespace-nowrap flex-shrink-0 bg-[#1d8263]/10"
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="/quiz" onClick={() => trackButtonClick('button-register-3', '/webinar')}>
              <Button
                size="lg"
                variant="default"
                className="px-12 py-3 h-auto bg-[#1d8263] hover:bg-[#1d8263]/90 border-0 min-w-[320px] md:min-w-[400px]"
                data-testid="button-register-3"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg md:text-xl font-semibold">Registruotis</span>
                  <span className="text-xs opacity-80 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Nemokamų vietų kiekis ribotas
                  </span>
                </div>
              </Button>
            </Link>
          </div>
        </section>

        {/* Rezultatų skaičiai */}
        <section className="py-12 px-6 lg:px-12">
          <div className="max-w-4xl md:max-w-3xl mx-auto space-y-6">
            <Card className="border-2" data-testid="stat-1">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-center gap-2 whitespace-nowrap">
                    Didesnis pardavimų rodiklis
                    <Percent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#1d8263]" />
                  </h3>
                  <div className="border-t-2 mx-4" />
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed px-2">
                    Greitas aptarnavimas padidins Jūsų komandos efektyvumą ir suteiks klientui geresnę patirtį, kas leis pasiekti didesnį pardavimų rodiklį ir įmonės augimą.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" data-testid="stat-2">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-center gap-2 whitespace-nowrap">
                    Mažesnės komandos išlaidos
                    <Euro className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#1d8263]" />
                  </h3>
                  <div className="border-t-2 mx-4" />
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed px-2">
                    Greitas ir žmogiškąs naujų užklausų kvalifikavimas ir ryšio palaikymas su senomis leidžia pardavėjams sutaupyti šimtus valandų ir skirti visą dėmesį potenciausiems klientams.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" data-testid="stat-3">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-center gap-2 whitespace-nowrap">
                    Didesnės užklausų apimtys
                    <Users2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#1d8263]" />
                  </h3>
                  <div className="border-t-2 mx-4" />
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed px-2">
                    Greitas atsakymas visą parą ir nuolatinis ryšys su klientais leidžia didinti reklamos biudžetus užklausoms, neprarandant kokybės ir užtikrinant pastovų augimą.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="/quiz" onClick={() => trackButtonClick('button-register-4', '/webinar')}>
              <Button
                size="lg"
                variant="default"
                className="px-12 py-3 h-auto bg-[#1d8263] hover:bg-[#1d8263]/90 border-0 min-w-[320px] md:min-w-[400px]"
                data-testid="button-register-4"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg md:text-xl font-semibold">Registruotis</span>
                  <span className="text-xs opacity-80 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Nemokamų vietų kiekis ribotas
                  </span>
                </div>
              </Button>
            </Link>
          </div>
        </section>

        {/* Bonusai užsiregistravus */}
        <section className="py-12 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8 md:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8" data-testid="text-bonuses-title">
                  Bonusai užsiregistravus
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <CheckCircle2 className="w-5 h-5 text-[#1d8263] flex-shrink-0" />
                    <p className="text-sm md:text-base lg:text-lg xl:text-xl tracking-tight">
                      3 dalyviai gaus nemokamą konsultaciją
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <Mail className="w-5 h-5 text-[#1d8263] flex-shrink-0" />
                    <p className="text-sm md:text-base lg:text-lg xl:text-xl tracking-tight">
                      Prieiga prie „Akseler AI" naujienlaiškio
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <Video className="w-5 h-5 text-[#1d8263] flex-shrink-0" />
                    <p className="text-sm md:text-base lg:text-lg xl:text-xl tracking-tight">
                      Vebinaro įrašas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pranešėjai */}
        <section className="py-12 px-6 lg:px-12">
          <div className="max-w-4xl md:max-w-3xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8 md:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8" data-testid="text-speakers-title">
                  Pranešėjai
                </h2>
                
                <div className="space-y-8 mb-8">
                  {/* Speaker 1: Photo LEFT, Text RIGHT */}
                  <div className="flex gap-5 items-center rounded-lg p-6 bg-white dark:bg-background shadow-sm border">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted flex-shrink-0" data-testid="speaker-1-avatar"></div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-1 leading-tight" data-testid="speaker-1-name">
                        Enrike Heinsohn
                      </h3>
                      <p className="text-sm md:text-base text-foreground/60" data-testid="speaker-1-title">Co-Founder</p>
                    </div>
                  </div>

                  {/* Speaker 2: Photo RIGHT, Text LEFT */}
                  <div className="flex flex-row-reverse gap-5 items-center rounded-lg p-6 bg-white dark:bg-background shadow-sm border">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted flex-shrink-0" data-testid="speaker-2-avatar"></div>
                    <div className="text-right flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-1 leading-tight text-left" data-testid="speaker-2-name">
                        Marius Vincevičius
                      </h3>
                      <p className="text-sm md:text-base text-foreground/60 text-left" data-testid="speaker-2-title">Co-Founder</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm md:text-base leading-relaxed text-foreground/80">
                  <h3 className="text-lg md:text-xl font-bold mb-4">Akseler Istorija</h3>
                  
                  <p className="text-balance">Pradėjome nuo leadų generavimo Facebook'e. Supratome, kad užklausa paslaugų versle dar nereiškia naujų pajamų.</p>
                  
                  <p className="text-balance">Pamatėme, kaip dažnai klientai stringa pardavimų etape. Pradėjome optimizuoti procesus ir dirbti kartu su jų pardavėjais.</p>
                  
                  <p className="text-balance">Didžiąją dalį darbo automatizavome, kad pardavėjai galėtų fokusuotis į tai, kas svarbiausia - bendravimą su klientais.</p>
                  
                  <p className="text-balance">Tačiau pardavėjai vistiek švaistydavo savo laiką kalbėdami su klientais po 10-15min., kartais net pusvalandžius ar daugiau — bet pardavimas neivykdavo.</p>
                  
                  <p className="text-balance">Kai AI pagaliau tapo pakankamai brandus, kad galėtume jį greitai ir tiksliai išmokyti pagal įmonės procesus — ėmėmės veiksmų.</p>
                  
                  <p className="text-balance">Šiandien mūsų įdiegtos AI sistemos jau apdorojusios virš 100 000 užklausų.</p>
                  
                  <p className="text-balance">AI tampa mūsų kasdienybės dalimi. Versle – tai neišvengiama.</p>
                  
                  <p className="text-balance">Ir mes čia tam, kad padėtume verslams šį pokytį ne tik pasivyti, bet išnaudoti jį savo naudai.</p>
                  
                  <p className="font-semibold text-balance">Kad kiekviena užklausa virstų klientu.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-10 px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="/quiz" onClick={() => trackButtonClick('button-register-final', '/webinar')}>
              <Button
                size="lg"
                variant="default"
                className="px-12 py-3 h-auto bg-[#1d8263] hover:bg-[#1d8263]/90 border-0 min-w-[320px] md:min-w-[400px]"
                data-testid="button-register-final"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg md:text-xl font-semibold">Registruotis</span>
                  <span className="text-xs opacity-80 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Nemokamų vietų kiekis ribotas
                  </span>
                </div>
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
