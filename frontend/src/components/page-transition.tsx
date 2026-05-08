"use client";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#09090f]">
      {children}
    </div>
  );
}
