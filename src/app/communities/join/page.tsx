import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import JoinCodeForm from "./JoinCodeForm";

export const metadata = { title: "Join a community - Koto" };

// A way in for someone who has the join link somewhere other than in front of
// them - in an email on another device, or read out to them. There is
// deliberately no search or list of communities: that would hand anyone the
// list of every customer, and a community's board is its own business. The
// code is how a community decides who may ask.
export default async function JoinCommunityPage() {
  await requireUser();

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Join a community</h1>
          <p className="mt-2 text-muted-foreground">
            Communities are joined with their join link or QR code. Got the
            link but not here? Paste it below.
          </p>
        </div>
        <JoinCodeForm />
      </div>
    </AppShell>
  );
}
