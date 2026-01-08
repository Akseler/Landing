import akselerLogo from "@assets/akseler black_1762708092193.png";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Logo and description */}
          <div>
            <img src={akselerLogo} alt="AKSELER" className="h-8 mb-4" data-testid="footer-logo" />
            <p className="text-sm text-foreground/70">Padedame paslaugų teikėjams augti su AI sistema, kuri 24/7 bendrauja su kontaktais ir vadybai perduoda tik karštus ir kvalifikuotus klientus.</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontaktai</h4>
            <div className="space-y-2 text-sm text-foreground/70">
              <p>El. paštas: info@akseler.lt</p>
              <p>Telefono numeris: +37062300244</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} AKSELER. Visos teisės saugomos.</p>
        </div>
      </div>
    </footer>
  );
}
