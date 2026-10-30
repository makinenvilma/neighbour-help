import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import CreateCommunityForm from "./CreateCommunityForm";

export const metadata = { title: "Create a community - Koto" };

// /communities/new rather than /community/new: the latter would sit among the
// community slugs, and a community whose slug was "new" could never be opened.
export default async function NewCommunityPage() {
  await requireUser();

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Create a community</h1>
          <p className="mt-2 text-muted-foreground">
            You become its admin. Next you get a join link and QR code to share,
            and you approve everyone who asks to join.
          </p>
        </div>
        <CreateCommunityForm />
      </div>
    </AppShell>
  );
}
