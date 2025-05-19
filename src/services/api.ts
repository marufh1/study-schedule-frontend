import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: "http://localhost:4000", // NestJS backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
