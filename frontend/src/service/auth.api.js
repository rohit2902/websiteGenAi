import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://websitegenai.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login({ name, email, avatar }) {
  const result = await api.post("/api/auth/login", { name, email, avatar });
  return result.data;
}

export async function LogOut() {
  const result = await api.get("/api/auth/logout");
  return result.data;
}

export async function getMe() {
  const result = await api.get("/api/auth/me");
  return result.data;
}
