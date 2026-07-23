/** Loading placeholder while the session resolves. */
export function AuthButtonSkeleton({ isInline }: { isInline: boolean }) {
  return isInline ? (
    <div className="h-10 w-full animate-pulse rounded-xl bg-[#141421]" />
  ) : (
    <div className="h-8 w-20 animate-pulse rounded-full bg-[#1e1e2a]" />
  );
}
