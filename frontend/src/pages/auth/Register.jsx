import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm";
import { useLanguage } from "../../hooks/useLanguage";

export default function Register() {
  const { t } = useLanguage();
  return (
    <AuthLayout
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
