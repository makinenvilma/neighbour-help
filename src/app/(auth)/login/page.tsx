import AuthForm from "../AuthForm";

export const metadata = { title: "Sign in - Koto" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthForm
      mode="signin"
      next={typeof next === "string" ? next : undefined}
    />
  );
}
