import api from "../api/axios";

export async function fetchMyStoreVerification() {
  const { data } = await api.get("/store-verification/mine");
  return data;
}

export async function submitStoreVerification(payload) {
  const { data } = await api.post("/store-verification/submit", payload);
  return data;
}
