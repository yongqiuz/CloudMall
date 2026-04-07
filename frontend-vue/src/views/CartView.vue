<template>
  <section class="page-card mt-24 fade-up">
    <h1 class="title">{{ t.title }}</h1>
    <p class="sub">{{ t.sub }}</p>
  </section>

  <section class="mt-24">
    <div v-if="!rows.length" class="empty page-card">{{ t.empty }}</div>
    <div v-else class="cart-list">
      <article v-for="item in rows" :key="item.id" class="page-card cart-item">
        <img :src="toImageUrl(item.picture)" :alt="zhProductName(item)" class="thumb" />
        <div class="grow">
          <h3>{{ zhProductName(item) }}</h3>
          <p class="sub">{{ t.price }}{{ money(item.price) }}</p>
          <div class="row mt-16">
            <input v-model.number="item.buynumber" class="input qty" type="number" min="1" />
            <button class="ghost-btn" @click="updateOne(item)">{{ t.update }}</button>
            <button class="button alt mini" @click="removeOne(item.id)">{{ t.remove }}</button>
          </div>
        </div>
      </article>
    </div>
  </section>

  <section v-if="rows.length" class="page-card mt-24 summary-row">
    <div>
      <p class="sub">{{ t.selected }} {{ rows.length }} {{ t.items }}</p>
      <strong class="price-main">{{ money(totalPrice) }}</strong>
    </div>
    <button class="button" @click="checkoutAll">{{ t.checkout }}</button>
  </section>

  <p v-if="message" class="hint mt-16">{{ message }}</p>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { api } from "../api/modules";
import { useUserStore } from "../stores/user";
import { money, toImageUrl } from "../utils/format";
import { zhProductName } from "../utils/zh";

const t = {
  title: "\u8d2d\u7269\u8f66",
  sub: "\u652f\u6301\u4fee\u6539\u6570\u91cf\u4e0e\u4e00\u952e\u4e0b\u5355",
  empty: "\u8d2d\u7269\u8f66\u8fd8\u662f\u7a7a\u7684",
  price: "\u5355\u4ef7\uff1a",
  update: "\u66f4\u65b0\u6570\u91cf",
  remove: "\u5220\u9664",
  selected: "\u5df2\u9009",
  items: "\u4ef6\u5546\u54c1",
  checkout: "\u4e00\u952e\u4e0b\u5355"
};

const userStore = useUserStore();
const rows = ref([]);
const message = ref("");

const totalPrice = computed(() => rows.value.reduce((s, i) => s + Number(i.price || 0) * Number(i.buynumber || 0), 0));

function createOrderPayload(item) {
  const amount = Number(item.price || 0) * Number(item.buynumber || 1);
  return {
    orderid: `OD${Date.now()}${item.id}`,
    tablename: item.tablename || "shangpinxinxi",
    userid: userStore.user?.id,
    goodid: item.goodid,
    goodname: zhProductName(item),
    picture: item.picture,
    buynumber: item.buynumber,
    price: item.price,
    discountprice: item.discountprice || item.price,
    total: amount,
    discounttotal: amount,
    type: 1,
    status: "\u5df2\u652f\u4ed8",
    address: "\u5f85\u8865\u5145\u6536\u8d27\u5730\u5740",
    tel: userStore.user?.shouji || "",
    consignee: userStore.user?.xingming || "\u6536\u8d27\u4eba",
    logistics: "\u5f85\u53d1\u8d27"
  };
}

async function loadCart() {
  const r = await api.getCart({ page: 1, limit: 100, sort: "id", order: "desc" });
  rows.value = r.data?.list || [];
}

async function updateOne(item) {
  await api.updateCart(item);
  message.value = "\u8d2d\u7269\u8f66\u5df2\u66f4\u65b0";
}

async function removeOne(id) {
  await api.deleteCart([id]);
  await loadCart();
}

async function checkoutAll() {
  for (const item of rows.value) {
    await api.createOrder(createOrderPayload(item));
  }
  await api.deleteCart(rows.value.map((i) => i.id));
  await loadCart();
  message.value = "\u4e0b\u5355\u5b8c\u6210";
}

onMounted(loadCart);
</script>
