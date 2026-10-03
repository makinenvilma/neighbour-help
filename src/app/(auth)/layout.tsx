import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// `(auth)` is a route group: the parentheses keep it out of the URL, so these
// pages live at /login and /signup while sharing this layout.
//
// No AppShell. Its navigation leads to pages a signed-out visitor cannot open.
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Someone already signed in has no use for these forms. Redirecting here is
  // fine even though layouts are not a security boundary: this protects
  // nothing, it only saves a pointless page.
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-2xl font-extrabold">Koto</p>
        {children}
      </div>
    </main>
  );
}
