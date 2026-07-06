export function getAwardButtonClass(expanded: boolean, examined: boolean): string {
  if (expanded) return "border-[#D4AF37] bg-[#D4AF37]/12";
  if (examined) return "border-[#3a3a53] bg-[#10101b] hover:border-[#D4AF37]/50";
  return "border-[#2a2a3e] bg-[#09090f] hover:border-[#e8453c]/60 hover:bg-[#141421]";
}
