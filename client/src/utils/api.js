import axios from "axios";

const api = axios.create({
  baseURL: "https://campuscart-server.onrender.com",
});

export default api;
