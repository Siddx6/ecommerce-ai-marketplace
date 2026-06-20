import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Attach the JWT token (if we have one) to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;