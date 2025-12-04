export default function FunnelSection() {
  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto mb-16">
          <div className="relative bg-muted/30 rounded-xl p-12 lg:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4" data-testid="text-funnel-title">
                Dirbtinis Intelektas
              </h2>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 gap-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-muted-foreground">Leadai</p>
                  </div>
                  <div className="flex-1 border-t-2 border-l-2 border-r-2 border-border h-16 rounded-t-lg"></div>
                  <div className="flex-1"></div>
                </div>
                
                <div className="flex items-center justify-center -mt-4">
                  <div className="w-full max-w-md">
                    <div className="relative" style={{ paddingBottom: '40%' }}>
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 40 0 L 360 0 L 280 160 L 120 160 Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-border"/>
                        <line x1="40" y1="40" x2="360" y2="40" stroke="currentColor" strokeWidth="1" className="text-border/50"/>
                        <line x1="50" y1="80" x2="350" y2="80" stroke="currentColor" strokeWidth="1" className="text-border/50"/>
                        <line x1="70" y1="120" x2="330" y2="120" stroke="currentColor" strokeWidth="1" className="text-border/50"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between -mt-4">
                  <div className="flex-1"></div>
                  <div className="flex-1 border-b-2 border-l-2 border-r-2 border-border h-16 rounded-b-lg"></div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-muted-foreground">Suplanavoti<br/>pokalbiai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl lg:text-3xl font-semibold mb-6" data-testid="text-market-title">
            Pritaikoma šiose rinkose
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-6" data-testid="card-service-1">
              <p className="font-medium">Grožio klinikos</p>
            </div>
            <div className="border border-border rounded-lg p-6" data-testid="card-service-2">
              <p className="font-medium">Finansinės paslaugos</p>
            </div>
            <div className="border border-border rounded-lg p-6" data-testid="card-service-3">
              <p className="font-medium">Nekilnojamas Turtas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
