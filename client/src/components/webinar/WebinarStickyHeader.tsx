export default function WebinarStickyHeader() {
  return (
    <div className="sticky top-0 z-50 bg-[#1d8263] text-white py-3 px-6 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 md:gap-8 text-sm md:text-base font-medium">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <div className="absolute w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
            <div className="relative w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-bold" data-testid="text-webinar-spots">Liko 9 nemokamos vietos</span>
        </div>
      </div>
    </div>
  );
}
