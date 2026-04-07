<template>
  <section class="page-card mt-24 fade-up">
    <h1 class="title">{{ t.title }}</h1>
    <p class="sub">{{ t.sub }}</p>
  </section>

  <section class="mt-24">
    <div v-if="loading" class="empty page-card">{{ t.loading }}</div>
    <div v-else-if="newsList.length" class="news-page-grid">
      <article v-for="item in newsList" :key="item.id" class="page-card news-page-card">
        <img :src="toImageUrl(item.picture)" :alt="zhNewsTitle(item)" />
        <h3>{{ zhNewsTitle(item) }}</h3>
        <p class="sub">{{ toDateText(item.addtime) }}</p>
        <p class="news-intro">{{ zhNewsIntro(item) || t.emptyIntro }}</p>
        <button class="ghost-btn" @click="openDetail(item)">{{ t.read }}</button>
      </article>
    </div>
    <div v-else class="empty page-card">{{ t.empty }}</div>
  </section>

  <section v-if="activeNews" class="page-card mt-24">
    <div class="section-head">
      <h2>{{ zhNewsTitle(activeNews) }}</h2>
      <button class="ghost-btn" @click="activeNews = null">{{ t.close }}</button>
    </div>
    <p class="sub">{{ toDateText(activeNews.addtime) }}</p>
    <div class="news-content" v-html="safeContent(activeNews.content)"></div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { api } from "../api/modules";
import { toDateText, toImageUrl } from "../utils/format";
import { isBrokenText, zhNewsIntro, zhNewsTitle } from "../utils/zh";

const t = {
  title: "\u5546\u57ce\u8d44\u8baf",
  sub: "\u6700\u65b0\u6d3b\u52a8\u4e0e\u5bfc\u8d2d",
  loading: "\u8d44\u8baf\u52a0\u8f7d\u4e2d...",
  empty: "\u6682\u65e0\u8d44\u8baf",
  emptyIntro: "\u6682\u65e0\u6458\u8981",
  read: "\u67e5\u770b\u5168\u6587",
  close: "\u6536\u8d77"
};

const loading = ref(false);
const newsList = ref([]);
const activeNews = ref(null);

function safeContent(content) {
  if (!content || isBrokenText(content)) {
    return "<p>\u8be5\u8d44\u8baf\u6b63\u5728\u6574\u7406\uff0c\u8bf7\u7a0d\u540e\u67e5\u770b\u3002</p>";
  }
  return content;
}

async function loadNews() {
  loading.value = true;
  try {
    const r = await api.getNews({ page: 1, limit: 12, sort: "id", order: "desc" });
    newsList.value = r.data?.list || [];
  } finally {
    loading.value = false;
  }
}

async function openDetail(item) {
  const r = await api.getNewsDetail(item.id);
  activeNews.value = r.data;
}

onMounted(loadNews);
</script>
