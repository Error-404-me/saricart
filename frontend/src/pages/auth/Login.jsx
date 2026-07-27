import AuthLayout from "../../layouts/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";
import { useLanguage } from "../../hooks/useLanguage";

export default function Login() {
  const { t } = useLanguage();
  return (
    <AuthLayout title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      <LoginForm />
    </AuthLayout>
  );
}
