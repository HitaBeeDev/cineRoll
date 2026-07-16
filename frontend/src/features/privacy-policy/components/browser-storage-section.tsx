import { PolicySection } from "@/features/legal/components/policy-section";

export function BrowserStorageSection() {
  return (
    <PolicySection title="Cookies and Local Storage">
      <p>
        CineRoll uses a small number of cookies and browser local-storage entries to run core
        features and understand product usage. We do not use third-party advertising or cross-site
        tracking cookies.
      </p>
      <p>Cookies:</p>
      <ul>
        <li>
          <strong>authjs.session-token</strong> — essential. Keeps you signed in across pages; set
          only after you sign in.
        </li>
        <li>
          <strong>cineroll_onboarded</strong> — functional. Remembers that you finished onboarding
          so it is not shown again; expires after one year.
        </li>
      </ul>
      <p>Local storage (kept on your device, not sent with every request):</p>
      <ul>
        <li>
          <strong>cineroll_anon_id</strong> — a random anonymous ID used to group analytics events
          for signed-out visitors.
        </li>
        <li>
          <strong>cineroll_session_id</strong> — a short-lived ID grouping events within a single
          browsing session.
        </li>
        <li>
          <strong>cineroll_impressed_film_ids</strong> — remembers films already shown so rolls do
          not immediately repeat them.
        </li>
        <li>
          <strong>cineroll_cookie_consent</strong> — stores your cookie-consent choice.
        </li>
        <li>
          <strong>cineroll-a2hs-dismissed-at</strong> — remembers when you dismissed the &quot;Add
          to Home Screen&quot; install prompt so it is not shown again for a while.
        </li>
      </ul>
      <p>
        You can clear cookies and local storage at any time through your browser settings. Clearing
        them signs you out and resets onboarding and analytics identifiers.
      </p>
    </PolicySection>
  );
}
