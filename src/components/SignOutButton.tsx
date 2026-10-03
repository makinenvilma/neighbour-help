import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";

/**
 * A form, not a link. Signing out changes state on the server, and a GET link
 * would sign people out whenever something prefetched or crawled it.
 */
export default function SignOutButton({ className }: { className: string }) {
  return (
    <form action={signOut}>
      <button type="submit" className={className}>
        <LogOut className="h-4 w-4 shrink-0" /> Sign out
      </button>
    </form>
  );
}
