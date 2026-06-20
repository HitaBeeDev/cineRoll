// Static hero headline for the home page. This is a Server Component: it ships
// no client JS and is rendered into the initial HTML (good for first paint and
// SEO). It is passed into the client home shell as a prop so the interactive
// layout around it stays client-side. Font size is intentionally NOT set here —
// the heading inherits `font-size` from its wrapper in HomeClient so the size
// can react to active filters; `transition-all` lets that inherited size animate.
export function HomeHero() {
  return (
    <h1 className="font-[family-name:var(--font-display)] font-bold leading-[0.95] tracking-tight text-[#F5F5F0] transition-all duration-300">
      One spin.
      <br />
      <span className="text-[#e8453c]">One film.</span>
      <br />
      Tonight.
    </h1>
  );
}
