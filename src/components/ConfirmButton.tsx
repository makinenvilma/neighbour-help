"use client";

/**
 * A submit button for a server action that asks "are you sure?" first. For
 * actions that cannot be undone from the page.
 *
 * The question is only a guard against a slip of the finger. It runs in the
 * browser, so it protects nothing; the action checks everything itself.
 */
export default function ConfirmButton({
  action,
  question,
  className,
  children,
}: {
  action: () => Promise<void>;
  question: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm(question)) event.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
