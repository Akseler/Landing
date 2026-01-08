import akselerLogo from "@assets/akseler black_1762708092193.png";
import { Link } from "wouter";

export default function SimpleHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-center">
        <Link href="/">
          <img 
            src={akselerLogo} 
            alt="AKSELER" 
            className="h-8 cursor-pointer" 
            data-testid="header-logo"
          />
        </Link>
      </div>
    </header>
  );
}
