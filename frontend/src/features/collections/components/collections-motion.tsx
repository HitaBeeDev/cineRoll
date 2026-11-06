"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./collections.module.css";

/** Animate the server-rendered content without making visibility depend on JS. */
export function CollectionsMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const images = Array.from(element.querySelectorAll<HTMLElement>("[data-image-drift]"));
    let frame = 0;
    const updateImages = () => {
      frame = 0;
      if (preference.matches) return;
      const height = window.innerHeight;
      for (const image of images) {
        if (!image.offsetParent) continue;
        const bounds = image.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > height) continue;
        const progress = Math.max(-1, Math.min(1, (bounds.top + bounds.height / 2 - height / 2) / height));
        image.style.transform = `translate3d(0, ${progress * Number(image.dataset.depth)}px, 0)`;
      }
    };
    const requestUpdate = () => {
      if (!frame && !preference.matches) frame = requestAnimationFrame(updateImages);
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    element.addEventListener("change", requestUpdate);
    requestUpdate();
    const reveal = (target: Element, delay = 0) => {
      if (preference.matches) return;
      const animation = target.animate(
        [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 600, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
      );
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    };
    element.querySelectorAll("[data-hero-reveal]").forEach((target, index) => reveal(target, index * 90));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const section = entry.target;
        reveal(section.querySelector("h2") ?? section);
        section.querySelectorAll("[data-collection-card]").forEach((card, index) => reveal(card, Math.min(index * 65, 260)));
        section.setAttribute("data-entered", "true");
        observer.unobserve(section);
      }
    }, { threshold: 0.08 });
    element.querySelectorAll("[data-collection-section]").forEach((section) => observer.observe(section));
    const stopMotion = () => {
      if (preference.matches) {
        animations.forEach((animation) => animation.cancel());
        cancelAnimationFrame(frame);
        frame = 0;
        images.forEach((image) => image.style.removeProperty("transform"));
      } else requestUpdate();
    };
    preference.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      element.removeEventListener("change", requestUpdate);
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", stopMotion);
    };
  }, []);

  return <div ref={root} className={styles.archive}>{children}</div>;
}
