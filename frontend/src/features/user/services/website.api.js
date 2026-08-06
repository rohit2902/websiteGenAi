import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://websitegenai.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function generateWebsite(prompt) {
  try {
    const result = await api.post("/api/website/generate", { prompt });
    return result.data;
  } catch (err) {
    console.error("Generate website API error:", err);
    throw err;
  }
}

export async function editWebsite(id, prompt) {
  try {
    const result = await api.post(`/api/website/${id}/edit`, { prompt });
    return result.data;
  } catch (err) {
    console.error("Edit website API error:", err);
    throw err;
  }
}

export async function getUserWebsites() {
  try {
    const result = await api.get("/api/website/user");
    return result.data;
  } catch (err) {
    console.error("Get user websites API error:", err);
    throw err;
  }
}

export async function getWebsite(id) {
  try {
    const result = await api.get(`/api/website/get-my-id/${id}`);
    return result.data;
  } catch (err) {
    console.error("Get website by ID API error:", err);
    throw err;
  }
}

export async function renameWebsite(id, title) {
  try {
    const result = await api.put(`/api/website/${id}/rename`, { title });
    return result.data;
  } catch (err) {
    console.error("Rename website API error:", err);
    throw err;
  }
}

export async function deleteWebsite(id) {
  try {
    const result = await api.delete(`/api/website/${id}`);
    return result.data;
  } catch (err) {
    console.error("Delete website API error:", err);
    throw err;
  }
}

export async function duplicateWebsite(id) {
  try {
    const result = await api.post(`/api/website/${id}/duplicate`);
    return result.data;
  } catch (err) {
    console.error("Duplicate website API error:", err);
    throw err;
  }
}

export async function deployWebsite(id, target = "vercel") {
  try {
    const result = await api.post(`/api/website/${id}/deploy`, { target });
    return result.data;
  } catch (err) {
    console.error("Deploy website API error:", err);
    throw err;
  }
}

export async function downloadWebsiteZip(id) {
  try {
    const response = await api.get(`/api/website/${id}/download`, {
      responseType: "blob",
    });
    return response;
  } catch (err) {
    console.error("Download website zip API error:", err);
    throw err;
  }
}

export async function updateWebsiteFile(id, path, content) {
  try {
    const result = await api.put(`/api/website/${id}/file`, { path, content });
    return result.data;
  } catch (err) {
    console.error("Update website file API error:", err);
    throw err;
  }
}