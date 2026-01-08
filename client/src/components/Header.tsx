import { Link } from "wouter";
import akselerLogo from "@assets/akseler logo_1761686356688.png";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-center">
        <Link href="/">
          <img 
            src={akselerLogo} 
            alt="AKSELER" 
            className="h-8 lg:h-10 cursor-pointer"
            data-testid="logo-header"
          />
        </Link>
      </div>
    </header>
  );
}
