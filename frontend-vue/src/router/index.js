import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user";

const routes = [
  { path: "/", name: "home", component: () => import("../views/HomeView.vue") },
  { path: "/products", name: "products", component: () => import("../views/ProductListView.vue") },
  { path: "/products/:id", name: "product-detail", component: () => import("../views/ProductDetailView.vue") },
  { path: "/news", name: "news", component: () => import("../views/NewsView.vue") },
  { path: "/cart", name: "cart", meta: { auth: true }, component: () => import("../views/CartView.vue") },
  { path: "/orders", name: "orders", meta: { auth: true }, component: () => import("../views/OrdersView.vue") },
  { path: "/profile", name: "profile", meta: { auth: true }, component: () => import("../views/ProfileView.vue") },
  { path: "/admin", name: "admin", component: () => import("../views/AdminPanelView.vue") },
  { path: "/login", name: "login", component: () => import("../views/LoginView.vue") },
  { path: "/register", name: "register", component: () => import("../views/RegisterView.vue") }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  const adminToken = localStorage.getItem("mall_admin_token");
  if (to.name === "admin" && !adminToken) {
    return { name: "login", query: { type: "admin" } };
  }
  if (to.meta.auth && !userStore.isLoggedIn) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
