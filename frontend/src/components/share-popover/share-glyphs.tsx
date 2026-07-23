import { Mail } from "lucide-react";
import { XGlyph } from "@/components/share-popover/glyphs/x-glyph";
import { WhatsAppGlyph } from "@/components/share-popover/glyphs/whatsapp-glyph";
import { TelegramGlyph } from "@/components/share-popover/glyphs/telegram-glyph";
import { RedditGlyph } from "@/components/share-popover/glyphs/reddit-glyph";

/** Maps a share-intent key to its brand glyph. */
export function ShareGlyph({ intent }: { intent: string }) {
  switch (intent) {
    case "x":
      return <XGlyph />;
    case "whatsapp":
      return <WhatsAppGlyph />;
    case "telegram":
      return <TelegramGlyph />;
    case "reddit":
      return <RedditGlyph />;
    case "email":
      return <Mail className="h-4 w-4" aria-hidden />;
    default:
      return null;
  }
}
