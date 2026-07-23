/** Decorative radial glow + faint grid behind the onboarding screen. */
export function OnboardingBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_72%_28%,rgba(232,69,60,0.16),transparent_32%),linear-gradient(135deg,#09090f_0%,#11111b_48%,#07070c_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.045] [background-image:linear-gradient(rgba(245,245,240,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(245,245,240,0.5)_1px,transparent_1px)] [background-size:56px_56px]" />
    </>
  );
}
