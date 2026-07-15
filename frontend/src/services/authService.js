import api from "../api/axios";

export async function registerUser({ username, email, password, role }) {
  const { data } = await api.post("/auth/register", {
    username,
    email,
    password,
    role,
  });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { access_token, token_type }
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/users/me");
  return data;
}
