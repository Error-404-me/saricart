import api from "../api/axios";

export async function fetchMyStore() {
  const { data } = await api.get("/stores/mine");
  return data;
}

export async function updateMyStore(payload) {
  const { data } = await api.patch("/stores/mine", payload);
  return data;
}

export async function fetchStore(id) {
  const { data } = await api.get(`/stores/${id}`);
  return data;
}

export async function fetchNearbyStores({ lat, lng, radiusKm = 10 }) {
  const { data } = await api.get("/stores/nearby", {
    params: { lat, lng, radius_km: radiusKm },
  });
  return data;
}

export async function fetchStoreReviews(id) {
  const { data } = await api.get(`/stores/${id}/reviews`);
  return data;
}
