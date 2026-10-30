import AuthForm from "../AuthForm";

export const metadata = { title: "Create an account - Koto" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthForm
      mode="signup"
      next={typeof next === "string" ? next : undefined}
    />
  );
}
