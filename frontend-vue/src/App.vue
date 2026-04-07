<template>
  <div v-if="isAdminRoute" class="app-shell">
    <main class="container page-main">
      <router-view />
    </main>
  </div>

  <div v-else class="app-shell">
    <AppHeader />
    <main class="container page-main">
      <router-view />
    </main>
    <footer class="site-footer">
      <div class="container footer-inner">
        <p>{{ t.brand }}</p>
        <p>{{ t.service }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "./components/AppHeader.vue";

const t = {
  brand: "\u0043\u006c\u006f\u0075\u0064\u004d\u0061\u006c\u006c - \u73b0\u4ee3\u5316\u0020\u0053\u0070\u0072\u0069\u006e\u0067\u0043\u006c\u006f\u0075\u0064\u0020\u5546\u57ce",
  service: "\u54c1\u8d28\u7cbe\u9009 \u00b7 \u5feb\u901f\u53d1\u8d27 \u00b7 \u5168\u7a0b\u552e\u540e"
};

const route = useRoute();
const isAdminRoute = computed(() => String(route.path || "").startsWith("/admin"));
</script>
