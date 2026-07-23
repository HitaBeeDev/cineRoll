import { cn } from "@/lib/utils";

/** Perforated film-strip edge used at the top and bottom of an empty state. */
export function FilmStrip({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-[5px] bg-[#060610] px-3 py-[7px] border-[#1a1a28]",
        edge === "top" ? "border-b" : "border-t",
      )}
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]"
        />
      ))}
    </div>
  );
}
