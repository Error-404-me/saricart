import AuthLayout from "../../layouts/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

export default function Login() {
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to pick up where you left off.">
      <LoginForm />
    </AuthLayout>
  );
}
