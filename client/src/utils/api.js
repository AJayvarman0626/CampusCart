import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ⚠️ change to deployed URL later
});

export default api;
