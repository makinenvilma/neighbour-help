"use client";

import { useActionState } from "react";
import { createCommunity, type CreateCommunityState } from "./actions";

const inputClasses =
  "mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 leading-6 text-foreground outline-none transition-colors duration-200 focus:border-ring";

export default function CreateCommunityForm() {
  const [state, formAction, pending] = useActionState<
    CreateCommunityState,
    FormData
  >(createCommunity, {});

  return (
    // `key` refills the field after a failed attempt, as in AuthForm.
    <form
      key={JSON.stringify(state)}
      action={formAction}
      className="space-y-5 rounded-lg border border-border bg-card p-6"
    >
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <p id="name-hint" className="mt-1 text-sm text-muted-foreground">
          What members call it, for example Maple Street or the Tuesday Chess
          Club.
        </p>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          aria-describedby="name-hint"
          defaultValue={state.name}
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
        {pending ? "Creating..." : "Create community"}
      </button>
    </form>
  );
}
