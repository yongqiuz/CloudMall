import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/springcloudk02l8";

export const fileBase = API_BASE;

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("mall_token");
  if (token) {
    config.headers.Token = token;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (typeof data?.code !== "undefined" && data.code !== 0) {
      return Promise.reject(new Error(data.msg || "服务开小差了，请稍后重试"));
    }
    return data;
  },
  (error) => {
    const message =
      error?.response?.data?.msg ||
      (error?.code === "ECONNABORTED" ? "请求超时，请检查网络后重试" : "网络异常，请稍后重试");
    return Promise.reject(new Error(message));
  }
);

export default http;
