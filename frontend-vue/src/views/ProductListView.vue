<template>
  <section class="page-card mt-24 fade-up">
    <h1 class="title">{{ txt.title }}</h1>
    <p class="sub">{{ txt.sub }}</p>
    <div class="filter-grid mt-16">
      <input v-model.trim="keyword" class="input" :placeholder="txt.search" />
      <select v-model="category" class="select">
        <option value="">{{ txt.allCategory }}</option>
        <option v-for="item in categories" :key="item.id" :value="item.leixing">{{ displayCategory(item.leixing) }}</option>
      </select>
      <select v-model="sortType" class="select">
        <option value="hot">{{ txt.hot }}</option>
        <option value="latest">{{ txt.latest }}</option>
        <option value="priceAsc">{{ txt.priceAsc }}</option>
        <option value="priceDesc">{{ txt.priceDesc }}</option>
      </select>
      <button class="button" @click="loadProducts(1)">{{ txt.filter }}</button>
    </div>
    <div class="list-toolbar mt-16">
      <span>{{ txt.total }} {{ total }} {{ txt.items }}</span>
      <span>{{ txt.page }} {{ page }}</span>
    </div>
  </section>

  <section class="mt-24">
    <div v-if="loading" class="empty page-card">{{ txt.loading }}</div>
    <template v-else>
      <div v-if="products.length" class="grid product-grid">
        <ProductCard v-for="item in products" :key="item.id" :item="normalizeProduct(item)" />
      </div>
      <div v-else class="empty page-card">{{ txt.empty }}</div>
    </template>
  </section>

  <section v-if="totalPage > 1" class="mt-24 page-card pager">
    <button class="ghost-btn" :disabled="page <= 1" @click="loadProducts(page - 1)">{{ txt.prev }}</button>
    <span>{{ txt.pageNo }} {{ page }} / {{ totalPage }}</span>
    <button class="ghost-btn" :disabled="page >= totalPage" @click="loadProducts(page + 1)">{{ txt.next }}</button>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "../api/modules";
import ProductCard from "../components/ProductCard.vue";
import { zhCategory, zhProductName } from "../utils/zh";

const txt = {
  title: '\u5168\u90e8\u5546\u54c1',
  sub: '\u652f\u6301\u5173\u952e\u8bcd\u3001\u5206\u7c7b\u548c\u6392\u5e8f\u7b5b\u9009\uff0c\u5feb\u901f\u627e\u5230\u76ee\u6807\u5546\u54c1\u3002',
  search: '\u641c\u7d22\u5546\u54c1\u540d\u79f0',
  allCategory: '\u5168\u90e8\u5206\u7c7b',
  hot: '\u6309\u70ed\u5ea6\u6392\u5e8f',
  latest: '\u6700\u65b0\u4e0a\u67b6',
  priceAsc: '\u4ef7\u683c\u4ece\u4f4e\u5230\u9ad8',
  priceDesc: '\u4ef7\u683c\u4ece\u9ad8\u5230\u4f4e',
  filter: '\u7b5b\u9009',
  total: '\u5171',
  items: '\u4ef6\u5546\u54c1',
  page: '\u5f53\u524d\u7b2c',
  loading: '\u5546\u54c1\u52a0\u8f7d\u4e2d...',
  empty: '\u5f53\u524d\u6761\u4ef6\u4e0b\u6682\u65e0\u5546\u54c1',
  prev: '\u4e0a\u4e00\u9875',
  next: '\u4e0b\u4e00\u9875',
  pageNo: '\u7b2c'
};

const route = useRoute();
const loading = ref(false);
const products = ref([]);
const categories = ref([]);
const keyword = ref("");
const category = ref(route.query.category ? String(route.query.category) : "");
const sortType = ref("hot");
const page = ref(1);
const totalPage = ref(1);
const total = ref(0);

const displayCategory = (name) => zhCategory(name);
const normalizeProduct = (p) => ({ ...p, shangpinleixing: zhCategory(p.shangpinleixing), shangpinmingcheng: zhProductName(p) });

function getSortParams() {
  if (sortType.value === "latest") return { sort: "id", order: "desc" };
  if (sortType.value === "priceAsc") return { sort: "price", order: "asc" };
  if (sortType.value === "priceDesc") return { sort: "price", order: "desc" };
  return { sort: "clicknum", order: "desc" };
}

async function loadCategories() {
  const res = await api.getCategories({ page: 1, limit: 50 });
  categories.value = res.data?.list || [];
}

async function loadProducts(nextPage = 1) {
  loading.value = true;
  page.value = nextPage;
  try {
    const params = { page: nextPage, limit: 16, ...getSortParams() };
    if (keyword.value) params.shangpinmingcheng = keyword.value;
    if (category.value) params.shangpinleixing = category.value;
    const res = await api.getProducts(params);
    products.value = res.data?.list || [];
    totalPage.value = Number(res.data?.totalPage || 1);
    total.value = Number(res.data?.total || 0);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadProducts(1)]);
});
</script>
