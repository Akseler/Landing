import { Button } from "@/components/ui/button";

export default function VideoSection() {
  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 tracking-tight" data-testid="text-video-title">
          Kaip veikia mūsų AI sistema
        </h2>
        
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-8 border border-border">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto hover-elevate cursor-pointer">
                <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-white text-sm">0:00 / 28:00</div>
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="px-12 h-14 text-lg font-medium"
            data-testid="button-register"
          >
            Registruotis į vebinarą
          </Button>
        </div>
      </div>
    </section>
  );
}
