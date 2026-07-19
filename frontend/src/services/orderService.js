import api from "../api/axios";

export async function placeOrder({ ownerId, items }) {
  const { data } = await api.post("/orders", {
    owner_id: ownerId,
    items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
  });
  return data;
}

export async function createWalkInSale(items) {
  const { data } = await api.post("/orders/walk-in", {
    items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
  });
  return data;
}

export async function fetchMyOrders() {
  const { data } = await api.get("/orders/mine");
  return data;
}

export async function fetchStoreOrders({ status } = {}) {
  const { data } = await api.get("/orders/store", { params: { status_filter: status } });
  return data;
}

export async function fetchOrder(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data;
}
