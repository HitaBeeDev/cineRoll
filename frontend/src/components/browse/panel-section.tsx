export function PanelSection({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2${className ? ` ${className}` : ""}`}>
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#8e899e]">
        {label}
      </span>
      {children}
    </div>
  );
}
