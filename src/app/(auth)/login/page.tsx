import AuthForm from "../AuthForm";

export const metadata = { title: "Sign in - Koto" };

export default function LoginPage() {
  return <AuthForm mode="signin" />;
}
