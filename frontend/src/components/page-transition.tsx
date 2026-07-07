export function PageTransition({ children }: { children: React.ReactNode }) {
  // flex-1 (not min-h-screen) so the content area fills the viewport *minus* the
  // footer — the canonical sticky-footer pattern. min-h-0 lets a child page run
  // its own internal scroll/overflow (e.g. the describe cockpit).
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#09090f]">
      {children}
    </div>
  );
}
