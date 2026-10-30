"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export type JoinCodeState = {
  error?: string;
  input?: string;
};

/**
 * The join code out of whatever was pasted: a whole join link from any host
 * ("https://koto.example/join/abc?x=1"), a bare code, or either with stray
 * spaces. Null if nothing in it looks like a code.
 *
 * Only letters and digits get through. The code ends up in a URL path, and a
 * "code" carrying "/", "?" or ".." would point the redirect somewhere other
 * than the join page.
 */
function codeFrom(input: string) {
  const afterJoin = input.match(/\/join\/([^/?#\s]+)/)?.[1];
  const code = (afterJoin ?? input).trim();
  return /^[a-z0-9]{8,64}$/i.test(code) ? code.toLowerCase() : null;
}

/**
 * Send the user to the join page for a pasted link or code. Whether the code
 * belongs to any community is the join page's question, not this one's: it
 * already answers it, with the same "this join link does not work" for every
 * wrong code, so this cannot be used to test codes any faster than that page.
 */
export async function goToJoinPage(
  _previous: JoinCodeState,
  formData: FormData,
): Promise<JoinCodeState> {
  await requireUser();

  const value = formData.get("code");
  const input = typeof value === "string" ? value : "";
  const code = codeFrom(input);
  if (!code) {
    return {
      input,
      error: "That does not look like a join link or code. Paste the whole link, or the code at its end.",
    };
  }

  redirect(`/join/${code}`);
}
