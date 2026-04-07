import axios from "axios";
import { showNotice } from "../utils/notice";

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
      showNotice(data.msg || "\u670d\u52a1\u5668\u5f02\u5e38");
      return Promise.reject(new Error(data.msg || "服务端异常"));
    }
    return data;
  },
  (error) => {
    const message =
      error?.response?.data?.msg ||
      (error?.code === "ECONNABORTED" ? "\u8bf7\u6c42\u8d85\u65f6\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u540e\u91cd\u8bd5" : "\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5");
    showNotice(message);
    return Promise.reject(new Error(message));
  }
);

export default http;
