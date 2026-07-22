export type ShareIntent = { key: string; label: string; href: string };

/** The high-intent share targets shown in the popover, with their deep links. */
export function buildShareIntents(title: string, url: string, caption?: string): ShareIntent[] {
  return [
    {
      key: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      key: "whatsapp",
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      key: "telegram",
      label: "Share on Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      key: "reddit",
      label: "Share on Reddit",
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
    {
      key: "email",
      label: "Share by email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${caption ?? title}\n\n${url}`)}`,
    },
  ];
}
