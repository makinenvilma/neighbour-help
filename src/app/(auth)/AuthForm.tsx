"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthFormState } from "./actions";

const inputClasses =
  "mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 leading-6 text-foreground outline-none transition-colors duration-200 focus:border-ring";

/**
 * The sign-in and sign-up forms. One component because they differ by a name
 * field and some wording; two would drift apart one tweak at a time.
 *
 * A plain <form action> rather than onSubmit + fetch: useActionState hands the
 * action's return value back as `state`, and the form still submits if the
 * JavaScript has not loaded yet.
 */
export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const signup = mode === "signup";
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signup ? signUp : signIn,
    {},
  );

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h1 className="text-xl font-bold text-card-foreground">
        {signup ? "Create an account" : "Sign in"}
      </h1>

      {/* React resets a form after its action runs, so the fields are refilled
          from `state` - otherwise one wrong password would also wipe the
          email. `key` makes React apply the new defaults on each attempt. */}
      <form
        key={JSON.stringify(state)}
        action={formAction}
        className="mt-6 space-y-5"
      >
        {signup && (
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              defaultValue={state.name}
              className={inputClasses}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          {/* autoComplete tells password managers whether to fill a saved
              password or offer to generate a new one. */}
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={signup ? "new-password" : "current-password"}
            required
            minLength={signup ? 8 : undefined}
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
          {pending
            ? signup
              ? "Creating account..."
              : "Signing in..."
            : signup
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {signup ? "Already have an account? " : "New here? "}
        <Link
          href={signup ? "/login" : "/signup"}
          className="font-medium text-primary hover:underline"
        >
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
