import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm";

export default function Register() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your store, or start pre-ordering from one."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
