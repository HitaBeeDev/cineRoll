/**
 * Repaints Chrome/Safari's autofill styling so filled inputs keep the dark
 * field look instead of the browser's pale blue/yellow background. The box-shadow
 * inset trick is the only reliable way to override the UA autofill background;
 * the long background-color transition is a belt-and-suspenders fallback. Lives
 * in a component (not a global stylesheet) and is rendered on the auth screens.
 */
export function AuthAutofillStyle() {
  return (
    <style>{`
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-text-fill-color: #F5F5F0 !important;
        -webkit-box-shadow: 0 0 0 1000px #10101d inset !important;
        box-shadow: 0 0 0 1000px #10101d inset !important;
        caret-color: #F5F5F0;
        border-radius: 0.75rem;
        transition: background-color 9999s ease-in-out 0s;
      }
    `}</style>
  );
}
