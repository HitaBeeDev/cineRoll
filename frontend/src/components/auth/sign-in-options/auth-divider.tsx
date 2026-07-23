/** "or" divider between the Google button and the credentials form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#1e1e2a]" />
      <span className="text-xs text-[#5a5a6e]">or</span>
      <div className="h-px flex-1 bg-[#1e1e2a]" />
    </div>
  );
}
