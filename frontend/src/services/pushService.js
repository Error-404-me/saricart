import api from "../api/axios";

export async function fetchVapidPublicKey() {
  const { data } = await api.get("/push/vapid-public-key");
  return data.public_key;
}

export async function registerPushSubscription(subscription) {
  await api.post("/push/subscribe", subscription.toJSON());
}

export async function unregisterPushSubscription(endpoint) {
  await api.post("/push/unsubscribe", { endpoint });
}