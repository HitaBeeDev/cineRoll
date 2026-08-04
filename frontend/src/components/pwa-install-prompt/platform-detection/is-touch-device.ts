/** Coarse-pointer phones/tablets only — never desktop. */
export function isTouchDevice(): boolean {
  return window.matchMedia("(pointer: coarse)").matches && window.innerWidth <= 1024;
}
