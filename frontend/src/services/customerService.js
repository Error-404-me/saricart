import api from "../api/axios";

export async function fetchFavorites() {
  const { data } = await api.get("/customers/favorites");
  return data;
}

export async function addFavorite(storeId) {
  const { data } = await api.post(`/customers/favorites/${storeId}`);
  return data;
}

export async function removeFavorite(storeId) {
  await api.delete(`/customers/favorites/${storeId}`);
}

export async function fetchBuyAgain() {
  const { data } = await api.get("/customers/buy-again");
  return data;
}

export async function fetchRecentlyBought() {
  const { data } = await api.get("/customers/recently-bought");
  return data;
}

export async function fetchSuggestions() {
  const { data } = await api.get("/customers/suggestions");
  return data;
}