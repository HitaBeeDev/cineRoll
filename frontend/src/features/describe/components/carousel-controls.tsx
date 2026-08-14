import { cn } from "@/lib/utils/cn";
import { CarouselArrow } from "./carousel-arrow";

type CarouselControlsProps = {
  maxPage: number;
  page: number;
  visibleCount: number;
  onPageChange: (page: number) => void;
};

export function CarouselControls({
  maxPage,
  page,
  visibleCount,
  onPageChange,
}: CarouselControlsProps) {
  if (maxPage === 0) return null;

  return (
    <div className="flex shrink-0 items-center justify-center gap-4">
      <CarouselArrow
        direction="prev"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      />
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Carousel position">
        {Array.from({ length: maxPage + 1 }).map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === page}
            aria-label={`Show picks ${index * visibleCount + 1}–${index * visibleCount + visibleCount}`}
            onClick={() => onPageChange(index)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === page
                ? "w-5 bg-[#e8453c]"
                : "w-1.5 bg-[#3a3a48] hover:bg-[#55556a]",
            )}
          />
        ))}
      </div>
      <CarouselArrow
        direction="next"
        disabled={page === maxPage}
        onClick={() => onPageChange(page + 1)}
      />
    </div>
  );
}
