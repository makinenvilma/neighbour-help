import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

/**
 * A form, not a link. Signing out changes state on the server, and a GET link
 * would sign people out whenever something prefetched or crawled it.
 */
export default function SignOutButton({ className }: { className: string }) {
  return (
    <form action={signOut}>
      {/* cursor-pointer here rather than at each call site: Tailwind v4 no
          longer gives buttons a pointer cursor, and every Sign out wants one. */}
      <button type="submit" className={`cursor-pointer ${className}`}>
        <LogOut className="h-4 w-4 shrink-0" /> Sign out
      </button>
    </form>
  );
}
