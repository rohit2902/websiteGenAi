import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://websitegenai.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function billing(planType) {
  try {
    const result = await api.post("/api/billing/", { planType });
    return result.data;
  } catch (err) {
    console.error("Billing API error:", err);
    throw err;
  }
}

export async function verifyPayment(sessionId) {
  try {
    const result = await api.post("/api/billing/verify", { sessionId });
    return result.data;
  } catch (err) {
    console.error("Payment verification API error:", err);
    throw err;
  }
}