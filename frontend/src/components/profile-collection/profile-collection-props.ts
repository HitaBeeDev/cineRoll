import type { ReactNode } from "react";

export type ProfileCollectionHeaderProps = { title: string };
export type ProfileCollectionErrorProps = { collectionName: string };
export type ProfileCollectionCountProps = {
  pluralLabel: string;
  hideWhenEmpty?: boolean;
  singularLabel: string;
  total: number;
};
export type ProfileCollectionEmptyProps = {
  description: string;
  icon: ReactNode;
  title: string;
};
export type ProfileCollectionLoadMoreProps = {
  isLoading: boolean;
  onClick: () => void;
};
