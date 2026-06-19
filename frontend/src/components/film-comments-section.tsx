"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type FilmComment = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  canDelete: boolean;
  user: {
    name: string | null;
    image: string | null;
  };
};

type CommentsResponse = {
  comments: FilmComment[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type Props = {
  slug: string;
  accent: string;
};

export function FilmCommentsSection({ slug, accent }: Props) {
  const { status } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<FilmComment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canPost = status === "authenticated";
  const remaining = 1000 - body.length;
  const commentCount = useMemo(() => comments.length, [comments]);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/films/${encodeURIComponent(slug)}/comments?page=1`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load comments");
        const data = (await res.json()) as CommentsResponse;
        if (!cancelled) {
          setComments(data.comments);
          setPage(data.page);
          setTotalPages(data.totalPages);
        }
      } catch {
        if (!cancelled) {
          toast({
            variant: "error",
            title: "Couldn't load comments",
            description: "Check your connection and try again.",
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadComments();
    return () => {
      cancelled = true;
    };
  }, [slug, toast]);

  async function loadMore() {
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/films/${encodeURIComponent(slug)}/comments?page=${nextPage}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load comments");
      const data = (await res.json()) as CommentsResponse;
      setComments((current) => [...current, ...data.comments]);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      toast({
        variant: "error",
        title: "Couldn't load more",
        description: "Check your connection and try again.",
      });
    }
  }

  async function postComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || isPosting) return;

    setIsPosting(true);
    const previousComments = comments;
    const optimisticComment: FilmComment = {
      id: `pending-${Date.now()}`,
      body: trimmed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      canDelete: false,
      user: {
        name: "You",
        image: null,
      },
    };
    setComments((current) => [optimisticComment, ...current]);
    setBody("");

    try {
      const res = await fetch(`/api/films/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { code?: string };
        const message =
          data.code === "FILM_NOT_WATCHED"
            ? "Mark this film watched before commenting."
            : "Your comment could not be posted.";
        throw new Error(message);
      }

      const comment = (await res.json()) as FilmComment;
      setComments((current) =>
        current.map((item) => item.id === optimisticComment.id ? comment : item),
      );
      toast({ title: "Comment posted" });
    } catch (error) {
      setComments(previousComments);
      setBody(trimmed);
      toast({
        variant: "error",
        title: "Couldn't post comment",
        description: error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsPosting(false);
    }
  }

  async function deleteComment(id: string) {
    if (deletingId) return;

    const previousComments = comments;
    setDeletingId(id);
    setComments((current) => current.filter((comment) => comment.id !== id));

    try {
      const res = await fetch(`/api/films/${encodeURIComponent(slug)}/comments/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete comment");
      toast({ title: "Comment deleted" });
    } catch {
      setComments(previousComments);
      toast({
        variant: "error",
        title: "Couldn't delete comment",
        description: "Try again in a moment.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section id="comments" className="scroll-mt-24">
      <div className="flex items-center gap-4">
        <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#e8453c]">
          ◆
        </span>
        <h2 className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.5em] text-[#c8c8e0]">
          Comments
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#2a2a42] to-transparent" />
        {!isLoading && (
          <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.28em] text-[#666680]">
            {commentCount}
          </span>
        )}
      </div>

      <div className="mt-8 space-y-6">
        {canPost ? (
          <form onSubmit={postComment} className="border border-[#1e1e30] bg-[#0d0d18] p-4 sm:p-5">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value.slice(0, 1000))}
              rows={4}
              placeholder="Add your take after watching..."
              className="min-h-28 w-full resize-y border border-[#25253a] bg-[#080810] px-4 py-3 text-sm leading-6 text-[#e8e8f0] outline-none transition-colors placeholder:text-[#555570] focus:border-[#e8453c]/60 focus:ring-1 focus:ring-[#e8453c]/50"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span
                className={cn(
                  "font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em]",
                  remaining < 80 ? "text-[#e8453c]" : "text-[#666680]",
                )}
              >
                {remaining}
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={isPosting || body.trim().length === 0}
                className="rounded-none border-0 px-4"
                style={{ backgroundColor: accent }}
              >
                {isPosting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Send className="h-3.5 w-3.5" aria-hidden />
                )}
                Post
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 border border-[#1e1e30] bg-[#0d0d18] p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#a8a8c0]">Sign in to comment.</p>
            <Button asChild size="sm" className="rounded-none border-0 px-4" style={{ backgroundColor: accent }}>
              <Link href="/auth/signin">Sign in</Link>
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-3 border border-[#1e1e30] bg-[#080810] p-5 text-sm text-[#8888a8]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading comments
            </div>
          ) : comments.length === 0 ? (
            <div className="border border-[#1e1e30] bg-[#080810] p-5 text-sm text-[#8888a8]">
              No comments yet.
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                deleting={deletingId === comment.id}
                onDelete={() => deleteComment(comment.id)}
              />
            ))
          )}
        </div>

        {page < totalPages && (
          <div className="flex justify-center">
            <Button variant="secondary" size="sm" className="rounded-none" onClick={loadMore}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  deleting,
  onDelete,
}: {
  comment: FilmComment;
  deleting: boolean;
  onDelete: () => void;
}) {
  const name = comment.user.name ?? "CineRoll user";

  return (
    <article className="border border-[#1e1e30] bg-[#080810] p-4 sm:p-5">
      <div className="flex gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#25253a] bg-[#11111c]">
          {comment.user.image ? (
            <Image src={comment.user.image} alt="" fill sizes="40px" className="object-cover" />
          ) : (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#8888a8]">
              {initials(name)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#e8e8f0]">{name}</p>
              <time
                dateTime={comment.createdAt}
                className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em] text-[#666680]"
              >
                {formatCommentDate(comment.createdAt)}
              </time>
            </div>
            {comment.canDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#25253a] text-[#666680] transition-colors hover:border-[#e8453c]/50 hover:text-[#e8453c] disabled:pointer-events-none disabled:opacity-50"
                aria-label="Delete comment"
                title="Delete comment"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                )}
              </button>
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#c8c8d8]">{comment.body}</p>
        </div>
      </div>
    </article>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function formatCommentDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
