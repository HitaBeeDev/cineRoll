export type Platform = "android" | "ios";

// Minimal shape of the (non-standard) beforeinstallprompt event.
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
