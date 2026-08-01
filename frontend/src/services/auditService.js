import api from "../api/axios";

export async function fetchAuditLogs({ action, limit = 50, offset = 0 } = {}) {
  const { data } = await api.get("/audit-logs", {
    params: { action, limit, offset },
  });
  return data;
}
