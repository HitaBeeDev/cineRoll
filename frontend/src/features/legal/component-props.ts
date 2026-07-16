import type { ReactNode } from "react";

export type LegalHeroProps = {
  title: string;
  updatedAt: string;
};

export type PolicySectionProps = {
  children: ReactNode;
  title: string;
};
