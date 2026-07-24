import api from "../api/axios";

export async function fetchSummary() {
  const { data } = await api.get("/analytics/summary");
  return data;
}

export async function fetchDailySales(days = 14) {
  const { data } = await api.get("/analytics/daily-sales", {
    params: { days },
  });
  return data;
}

export async function fetchMonthlySales(months = 6) {
  const { data } = await api.get("/analytics/monthly-sales", {
    params: { months },
  });
  return data;
}

export async function fetchBestSellers(limit = 10) {
  const { data } = await api.get("/analytics/best-sellers", {
    params: { limit },
  });
  return data;
}

export async function fetchSalesHeatmap(weeks = 12) {
  const { data } = await api.get("/analytics/heatmap", { params: { weeks } });
  return data;
}

export async function fetchRestockSuggestions() {
  const { data } = await api.get("/analytics/restock-suggestions");
  return data;
}

export async function fetchSlowMovingProducts() {
  const { data } = await api.get("/analytics/slow-moving");
  return data;
}

export async function fetchFastestSelling(limit = 5) {
  const { data } = await api.get("/analytics/fastest-selling", { params: { limit } });
  return data;
}