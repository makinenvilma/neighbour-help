"use client";

import { useActionState } from "react";
import { goToJoinPage, type JoinCodeState } from "./actions";

const inputClasses =
  "mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 leading-6 text-foreground outline-none transition-colors duration-200 focus:border-ring";

export default function JoinCodeForm() {
  const [state, formAction, pending] = useActionState<JoinCodeState, FormData>(
    goToJoinPage,
    {},
  );

  return (
    // `key` refills the field after a failed attempt, as in AuthForm.
    <form
      key={JSON.stringify(state)}
      action={formAction}
      className="space-y-5 rounded-lg border border-border bg-card p-6"
    >
      <div>
        <label htmlFor="code" className="text-sm font-medium">
          Join link or code
        </label>
        <p id="code-hint" className="mt-1 text-sm text-muted-foreground">
          Paste the link an admin shared, or type the code at its end.
        </p>
        <input
          id="code"
          name="code"
          required
          autoComplete="off"
          spellCheck={false}
          aria-describedby="code-hint"
          defaultValue={state.input}
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
        {pending ? "Opening..." : "Continue"}
      </button>
    </form>
  );
}
