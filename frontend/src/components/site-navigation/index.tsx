"use client";

import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useMobileMenu } from "@/components/site-navigation/useMobileMenu";
import { DesktopNav } from "@/components/site-navigation/desktop-nav";
import { MobileNavMenu } from "@/components/site-navigation/mobile-nav-menu";
import { MenuToggleButton } from "@/components/site-navigation/menu-toggle-button";

type SiteNavigationProps = {
  focusRingClassName?: string;
};

export function SiteNavigation({
  focusRingClassName = "focus-visible:ring-[#e8453c]",
}: SiteNavigationProps) {
  const pathname = usePathname();
  const menu = useMobileMenu();

  return (
    <>
      <DesktopNav pathname={pathname} focusRingClassName={focusRingClassName} />

      <MenuToggleButton
        isOpen={menu.isOpen}
        onOpen={menu.open}
        focusRingClassName={focusRingClassName}
      />

      {menu.isOpen && menu.mounted
        ? createPortal(
            <MobileNavMenu
              pathname={pathname}
              focusRingClassName={focusRingClassName}
              onClose={menu.close}
            />,
            document.body,
          )
        : null}
    </>
  );
}
