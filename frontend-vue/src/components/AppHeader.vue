<template>
  <header class="header-wrap">
    <div class="container nav-box">
      <router-link class="brand" to="/">
        <span class="logo-dot"></span>
        <span>CloudMall</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/">{{ t.home }}</router-link>
        <router-link to="/products">{{ t.products }}</router-link>
        <router-link to="/news">{{ t.news }}</router-link>
        <router-link to="/cart">{{ t.cart }}</router-link>
        <router-link to="/orders">{{ t.orders }}</router-link>
      </nav>

      <div class="actions">
        <router-link v-if="isAdmin" class="ghost-btn admin-back-btn" to="/admin">{{ t.admin }}</router-link>
        <template v-if="userStore.isLoggedIn">
          <router-link class="ghost-btn" to="/profile">{{ userStore.user?.xingming || t.profile }}</router-link>
          <button class="ghost-btn" @click="logout">{{ t.logout }}</button>
        </template>
        <template v-else>
          <router-link class="ghost-btn" to="/login">{{ t.login }}</router-link>
          <router-link class="solid-btn" to="/register">{{ t.register }}</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();
const isAdmin = computed(() => Boolean(localStorage.getItem("mall_admin_token")));

const t = {
  home: "\u9996\u9875",
  products: "\u5168\u90e8\u5546\u54c1",
  news: "\u5546\u57ce\u8d44\u8baf",
  cart: "\u8d2d\u7269\u8f66",
  orders: "\u6211\u7684\u8ba2\u5355",
  profile: "\u4e2a\u4eba\u4e2d\u5fc3",
  admin: "\u8fd0\u8425\u540e\u53f0",
  logout: "\u9000\u51fa",
  login: "\u767b\u5f55",
  register: "\u6ce8\u518c"
};

function logout() {
  userStore.logout();
  localStorage.removeItem("mall_admin_token");
  router.push("/");
}
</script>
