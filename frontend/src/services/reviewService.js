import api from "../api/axios";

export async function createReview({ orderId, rating, comment }) {
  const { data } = await api.post("/reviews", {
    order_id: orderId,
    rating,
    comment: comment || undefined,
  });
  return data;
}
