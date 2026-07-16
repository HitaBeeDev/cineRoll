import { PolicySection } from "@/features/legal/components/policy-section";

export function DataProcessorsSection() {
  return (
    <PolicySection title="Processors">
      <p>CineRoll relies on these service providers to operate the app:</p>
      <ul>
        <li>Neon for hosted PostgreSQL database storage.</li>
        <li>Railway for backend hosting and runtime infrastructure.</li>
        <li>Vercel for frontend hosting and serverless routes.</li>
        <li>Resend for sign-in and feedback notification emails.</li>
        <li>TMDB and OMDB for film metadata enrichment and poster or movie reference data.</li>
      </ul>
    </PolicySection>
  );
}
