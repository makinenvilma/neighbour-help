"use client";

import { useActionState } from "react";
import type { JoinFormState } from "./actions";

const inputClasses =
  "mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 leading-6 text-foreground outline-none transition-colors duration-200 focus:border-ring";

/**
 * The one-field join request form. `action` arrives with the join code already
 * bound by the page, so the form never handles the code itself.
 */
export default function JoinForm({
  action,
}: {
  action: (state: JoinFormState, formData: FormData) => Promise<JoinFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    // `key` refills the field after a failed attempt, as in AuthForm.
    <form key={JSON.stringify(state)} action={formAction} className="space-y-5">
      <div>
        <label htmlFor="apartment" className="text-sm font-medium">
          Your apartment
        </label>
        <p id="apartment-hint" className="mt-1 text-sm text-muted-foreground">
          So the admins know who you are, for example A 12.
        </p>
        <input
          id="apartment"
          name="apartment"
          required
          maxLength={50}
          aria-describedby="apartment-hint"
          defaultValue={state.apartment}
          className={inputClasses}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending..." : "Ask to join"}
      </button>
    </form>
  );
}
