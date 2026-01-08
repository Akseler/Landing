import { AlertCircle } from "lucide-react";

export default function AlertSection() {
  return (
    <section className="py-16 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-100 border border-red-200 rounded-xl p-6 flex gap-4">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground leading-relaxed" data-testid="text-alert">
              <strong>Rezultatas:</strong> prarastos galimybės, nepastovūs pardavimai, prarędę pardavėjai. Daug įmonių tai 
              laiko „normia", nesuvokdamos, kiek tai kainuoja kiekvieno mėnesį.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
