import { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Akseler — Puslapis nerastas";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="text-center px-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Oops, ne ten pataikei!
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Šitas puslapis neegzistuoja arba buvo perkeltas.
          </p>
          
          <button
            onClick={() => setLocation("/")}
            className="px-8 py-4 bg-[#1d8263] hover:bg-[#166b52] text-white font-semibold rounded-xl transition-colors duration-300"
          >
            Grįžti į pradžią
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
