import AuthForm from "../AuthForm";

export const metadata = { title: "Create an account - Koto" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
