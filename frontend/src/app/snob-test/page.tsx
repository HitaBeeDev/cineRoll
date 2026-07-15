import { redirect } from "next/navigation";

// The Snob Test was reworked into the Taste Test. Keep this path as a permanent
// redirect so old links and shares still land somewhere sensible.
export default function SnobTestPage() {
  redirect("/taste-test");
}
