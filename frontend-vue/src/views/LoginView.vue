<template>
  <section class="auth-card page-card mt-24 fade-up">
    <h1 class="title">{{ t.title }}</h1>
    <p class="sub">{{ t.sub }}</p>

    <div class="row mt-16">
      <button class="ghost-btn" :class="{ active: identity === 'user' }" @click="identity = 'user'">{{ t.userLogin }}</button>
      <button class="ghost-btn" :class="{ active: identity === 'admin' }" @click="identity = 'admin'">{{ t.adminLogin }}</button>
    </div>

    <label class="field mt-16">
      <span>{{ t.user }}</span>
      <input v-model.trim="form.username" class="input" :placeholder="t.userPh" />
    </label>
    <label class="field mt-16">
      <span>{{ t.pass }}</span>
      <input v-model.trim="form.password" type="password" class="input" :placeholder="t.passPh" />
    </label>

    <button class="button mt-24" @click="submit">{{ t.login }}</button>
    <p v-if="error" class="hint error mt-16">{{ error }}</p>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api/modules";
import { useUserStore } from "../stores/user";

const t = {
  title: "\u6b22\u8fce\u767b\u5f55 CloudMall",
  sub: "\u4f7f\u7528\u540c\u4e00\u767b\u5f55\u9875\uff0c\u901a\u8fc7\u8eab\u4efd\u6807\u8bc6\u8fdb\u5165\u4e0d\u540c\u9996\u9875",
  userLogin: "\u7528\u6237\u767b\u5f55",
  adminLogin: "\u7ba1\u7406\u5458\u767b\u5f55",
  user: "\u8d26\u53f7",
  pass: "\u5bc6\u7801",
  userPh: "\u8bf7\u8f93\u5165\u8d26\u53f7",
  passPh: "\u8bf7\u8f93\u5165\u5bc6\u7801",
  login: "\u767b\u5f55"
};

const ADMIN_TOKEN_KEY = "mall_admin_token";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const error = ref("");
const identity = ref(route.query.type === "admin" ? "admin" : "user");
const form = reactive({ username: "", password: "" });

async function submit() {
  error.value = "";
  if (!form.username || !form.password) {
    error.value = "\u8bf7\u8f93\u5165\u5b8c\u6574\u8d26\u53f7\u548c\u5bc6\u7801";
    return;
  }

  try {
    if (identity.value === "admin") {
      const adminRes = await api.adminLogin({ username: form.username, password: form.password, captcha: "1234" });
      localStorage.setItem(ADMIN_TOKEN_KEY, adminRes.token);
      const userRes = await api.login({ username: form.username, password: form.password, captcha: "1234" });
      userStore.setLogin(userRes.token, null);
      const sessionRes = await api.getSession();
      userStore.setUser(sessionRes.data);
      router.push("/admin");
      return;
    }

    localStorage.removeItem(ADMIN_TOKEN_KEY);
    const lr = await api.login({ username: form.username, password: form.password, captcha: "1234" });
    userStore.setLogin(lr.token, null);
    const sr = await api.getSession();
    userStore.setUser(sr.data);
    router.push(String(route.query.redirect || "/"));
  } catch (e) {
    error.value = e.message || "\u767b\u5f55\u5931\u8d25";
  }
}
</script>
