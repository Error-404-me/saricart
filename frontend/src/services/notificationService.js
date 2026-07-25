import api from "../api/axios";

export async function fetchNotifications() {
  const { data } = await api.get("/notifications");
  return data;
}

export async function fetchUnreadCount() {
  const { data } = await api.get("/notifications/unread-count");
  return data.unread_count;
}

export async function markNotificationRead(id) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await api.patch("/notifications/read-all");
}