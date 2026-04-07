import http from "./http";

function toForm(params) {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => body.append(key, String(value ?? "")));
  return body;
}

export const api = {
  login(payload) {
    return http.post("/yonghu/login", toForm(payload));
  },
  adminLogin(payload) {
    return http.post("/users/login", toForm(payload));
  },
  register(payload) {
    return http.post("/yonghu/register", payload);
  },
  getSession() {
    return http.get("/yonghu/session");
  },
  getAdminSession() {
    return http.get("/users/session");
  },
  updateProfile(payload) {
    return http.post("/yonghu/update", payload);
  },
  getCategories(params = { page: 1, limit: 50 }) {
    return http.get("/shangpinfenlei/list", { params });
  },
  getProducts(params) {
    return http.get("/shangpinxinxi/list", { params });
  },
  getProductDetail(id) {
    return http.get(`/shangpinxinxi/detail/${id}`);
  },
  getComments(params) {
    return http.get("/discussshangpinxinxi/list", { params });
  },
  addComment(payload) {
    return http.post("/discussshangpinxinxi/add", payload);
  },
  getNews(params) {
    return http.get("/news/list", { params });
  },
  getNewsDetail(id) {
    return http.get(`/news/detail/${id}`);
  },
  addToCart(payload) {
    return http.post("/cart/add", payload);
  },
  getCart(params) {
    return http.get("/cart/page", { params });
  },
  updateCart(payload) {
    return http.post("/cart/update", payload);
  },
  deleteCart(ids) {
    return http.post("/cart/delete", ids);
  },
  createOrder(payload) {
    return http.post("/orders/add", payload);
  },
  getOrders(params) {
    return http.get("/orders/page", { params });
  }
};
