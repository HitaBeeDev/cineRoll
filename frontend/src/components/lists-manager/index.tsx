"use client";

import { useState } from "react";
import type { UserListSummary } from "@cineroll/types";
import { useUserLists } from "@/hooks/useUserLists";
import { ListsHeader } from "@/components/lists-manager/lists-header";
import { CreateListForm } from "@/components/lists-manager/create-list-form";
import { ListsEmptyState } from "@/components/lists-manager/lists-empty-state";
import { ListGrid } from "@/components/lists-manager/list-grid";

/**
 * The lists overview: heading + create form, an empty prompt, or the grid of
 * collection cards. List state and its create/rename/delete mutations live in
 * `useUserLists`; this component only wires them to the presentational sections.
 */
export function ListsManager({
  initialLists,
  maxLists,
}: {
  initialLists: UserListSummary[];
  maxLists: number;
}) {
  const { lists, atLimit, creating, createList, renameList, deleteList } = useUserLists(
    initialLists,
    maxLists,
  );
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="mt-6">
      <ListsHeader showNewList={!formOpen} atLimit={atLimit} onNewList={() => setFormOpen(true)} />

      {formOpen && (
        <CreateListForm
          creating={creating}
          atLimit={atLimit}
          onCreate={createList}
          onClose={() => setFormOpen(false)}
        />
      )}

      {lists.length === 0 && !formOpen ? (
        <ListsEmptyState onNewList={() => setFormOpen(true)} />
      ) : (
        lists.length > 0 && (
          <ListGrid
            lists={lists}
            atLimit={atLimit}
            maxLists={maxLists}
            onRename={renameList}
            onDelete={deleteList}
          />
        )
      )}
    </div>
  );
}
