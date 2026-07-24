import api from "../api/axios";

export async function updateProfile(payload) {
  const { data } = await api.patch("/users/me", payload);
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  await api.patch("/users/me/password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

export async function updateNotificationPreferences(payload) {
  const { data } = await api.patch("/users/me/notifications", payload);
  return data;
}

export async function deleteAccount(password) {
  await api.delete("/users/me", { data: { password } });
}