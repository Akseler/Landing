import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Link } from "wouter";
import tomasImg from "@assets/testimonials tomas_1761686350506.jpg";
import mindaugasImg from "@assets/testimonials mindaugas_1761686350506.jpg";
import renatasImg from "@assets/testimonials renatas_1761686350506.jpg";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Tomas",
      revenue: "1.1M apyvartos 2024m.",
      image: tomasImg,
      quote: "Mokėjome už reklamas, bet nuolat prarasdavome užklausas. Registratorė nespėdavo, o savaitgaliais praktiškai degindavome biudžetą. Įsidiegus Akseler AI, pirmą savaitę suplanuotų pokalbių kiekis šoktelėjo 2,3 karto, o mūsų komanda dabar kalba tik su tais, kurie jau pasiruošę. Pirmą kartą pardavimų skaičiai auga ne didinant biudžetą, o tvarkant procesą.",
    },
    {
      name: "Mindaugas",
      revenue: "22M apyvartos 2024m.",
      image: mindaugasImg,
      quote: "Mokėjome už reklamas, bet nuolat prarasdavome užklausas. Registratorė nespėdavo, o savaitgaliais praktiškai degindavome biudžetą. Įsidiegus Akseler AI, pirmą savaitę suplanuotų pokalbių kiekis šoktelėjo 2,3 karto, o mūsų komanda dabar kalba tik su tais, kurie jau pasiruošę.",
    },
    {
      name: "Renatas",
      revenue: "1.2M apyvartos 2024m.",
      image: renatasImg,
      quote: "Mokėjome už reklamas, bet nuolat prarasdavome užklausas. Registratorė nespėdavo, o savaitgaliais praktiškai degindavome biudžetą. Įsidiegus Akseler AI, pirmą savaitę suplanuotų pokalbių kiekis šoktelėjo 2,3 karto, o mūsų komanda dabar kalba tik su tais, kurie jau pasiruošę. Pirmą kartą pardavimų skaičiai auga ne didinant biudžetą, o tvarkant procesą.",
    },
  ];

  return (
    <section className="py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className={`flex flex-col lg:flex-row gap-8 items-center ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
            data-testid={`testimonial-${index + 1}`}
          >
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-2xl mb-1" data-testid={`text-name-${testimonial.name.toLowerCase()}`}>
                  {testimonial.name}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid={`text-revenue-${testimonial.name.toLowerCase()}`}>
                  {testimonial.revenue}
                </p>
              </div>
              
              <blockquote className="text-base lg:text-lg text-foreground leading-relaxed border-l-4 border-border pl-6 italic" data-testid={`text-quote-${testimonial.name.toLowerCase()}`}>
                "{testimonial.quote}"
              </blockquote>
            </div>
            
            <div className="flex-1 w-full lg:w-auto">
              <div className="aspect-[4/5] bg-muted rounded-xl overflow-hidden max-w-md mx-auto">
                <Avatar className="h-full w-full rounded-xl" data-testid={`avatar-${testimonial.name.toLowerCase()}`}>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} className="object-cover" />
                  <AvatarFallback className="rounded-xl text-4xl">{testimonial.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-center mt-30 md:mt-20 mb-12">
          <Link href="/webinar">
            <Button 
              size="lg" 
              variant="default"
              className="px-12 py-3 h-auto btn-gradient hover:opacity-95 border-0 min-w-[320px] md:min-w-[400px]"
              data-testid="button-register-testimonials"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg md:text-xl font-semibold">Gauti kvietimą į AI vebinarą</span>
                <span className="text-xs opacity-80 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Nemokamų vietų kiekis ribotas
                </span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
