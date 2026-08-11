import { Link } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <div
        className="h-9 w-24 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-elevated)]"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex h-9 min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 text-xs font-medium text-[var(--color-fg)] transition-colors hover:bg-[var(--color-elevated)]"
      >
        <LogIn className="h-3.5 w-3.5" />
        ログイン
      </Link>
    );
  }

  const label = user.displayName ?? user.primaryEmail ?? "来館者";

  return (
    <div className="flex max-w-[12rem] items-center gap-2 sm:max-w-none">
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-elevated)] text-xs font-medium text-[var(--color-muted)]">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-[7rem] truncate text-xs font-medium text-[var(--color-muted)] sm:inline">
        {label}
      </span>
      {authEnabled && (
        <button
          type="button"
          onClick={() => void signOut()}
          className="inline-flex h-9 min-h-9 items-center gap-1 rounded-[var(--radius-sm)] px-2 text-xs text-[var(--color-subtle)] transition-colors hover:bg-[var(--color-elevated)] hover:text-[var(--color-fg)]"
          aria-label="ログアウト"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">退出</span>
        </button>
      )}
    </div>
  );
}
