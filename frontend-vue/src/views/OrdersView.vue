<template>
  <section class="page-card mt-24 fade-up">
    <h1 class="title">{{ t.title }}</h1>
    <p class="sub">{{ t.sub }}</p>
  </section>

  <section class="mt-24">
    <div v-if="!orders.length" class="empty page-card">{{ t.empty }}</div>
    <div v-else class="order-list">
      <article v-for="item in orders" :key="item.id" class="page-card order-item">
        <img :src="toImageUrl(item.picture)" :alt="zhProductName(item)" class="thumb" />
        <div class="grow">
          <div class="order-head">
            <h3>{{ zhProductName(item) }}</h3>
            <span class="status-pill">{{ item.status || t.wait }}</span>
          </div>
          <p class="sub">{{ t.no }}{{ item.orderid }}</p>
          <p class="sub">{{ t.qty }}{{ item.buynumber }}，{{ t.price }}{{ money(item.price) }}</p>
          <p class="sub">{{ t.logistics }}{{ item.logistics || t.waitShip }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "../api/modules";
import { money, toImageUrl } from "../utils/format";
import { zhProductName } from "../utils/zh";

const t = {
  title: "\u6211\u7684\u8ba2\u5355",
  sub: "\u67e5\u770b\u8ba2\u5355\u72b6\u6001\u4e0e\u7269\u6d41",
  empty: "\u6682\u65e0\u8ba2\u5355",
  wait: "\u5904\u7406\u4e2d",
  no: "\u8ba2\u5355\u53f7\uff1a",
  qty: "\u6570\u91cf\uff1a",
  price: "\u5355\u4ef7\uff1a",
  logistics: "\u7269\u6d41\uff1a",
  waitShip: "\u5f85\u53d1\u8d27"
};

const orders = ref([]);

onMounted(async () => {
  const r = await api.getOrders({ page: 1, limit: 100, sort: "id", order: "desc" });
  orders.value = r.data?.list || [];
});
</script>
