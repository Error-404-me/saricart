import api from "../api/axios";

export async function registerUser({
  username,
  email,
  password,
  role,
  acceptedTerms,
  acceptedPrivacy,
}) {
  const { data } = await api.post("/auth/register", {
    username,
    email,
    password,
    role,
    accepted_terms: acceptedTerms,
    accepted_privacy: acceptedPrivacy,
  });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function verifyEmail(token) {
  const { data } = await api.post("/auth/verify-email", { token });
  return data;
}

export async function resendVerification(email) {
  await api.post("/auth/resend-verification", { email });
}

export async function forgotPassword(email) {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token, newPassword) {
  await api.post("/auth/reset-password", { token, new_password: newPassword });
}
  