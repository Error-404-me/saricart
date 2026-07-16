import api from "../api/axios";

export async function browseProducts({ search, category } = {}) {
  const { data } = await api.get("/products", { params: { search, category } });
  return data;
}

export async function browseCategories() {
  const { data } = await api.get("/products/categories");
  return data;
}

export async function fetchMyProducts({ search, category } = {}) {
  const { data } = await api.get("/products/mine", { params: { search, category } });
  return data;
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function fetchMyCategories(ownerId) {
  const { data } = await api.get("/products/categories", { params: { owner_id: ownerId } });
  return data;
}

export async function createProduct(payload) {
  const { data } = await api.post("/products", payload);
  return data;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}

export async function uploadProductImage(id, file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`/products/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
