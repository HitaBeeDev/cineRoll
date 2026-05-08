import { cn } from "@/lib/utils";

const shimmerCSS = `@keyframes cineroll-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}`;

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerCSS }} />
      <div
        className={cn("rounded-md", className)}
        style={{
          background: "linear-gradient(90deg,#1a1a24 0%,#22222f 50%,#1a1a24 100%)",
          backgroundSize: "200% 100%",
          animation: "cineroll-shimmer 1.5s ease-in-out infinite",
        }}
        {...props}
      />
    </>
  );
}
