<template>
  <section class="market-entry fade-up">
    <aside class="category-panel page-card">
      <p class="panel-title">{{ t.allCategories }}</p>
      <router-link
        v-for="item in categories.slice(0, 12)"
        :key="item.id"
        class="category-link"
        :to="`/products?category=${encodeURIComponent(item.leixing || '')}`"
      >
        <span>{{ zhCategory(item.leixing) }}</span>
        <span>&gt;</span>
      </router-link>
      <router-link class="category-more" to="/products">{{ t.viewAllProducts }}</router-link>
    </aside>

    <article>
      <div class="hero-carousel">
        <div
          v-for="(item, idx) in heroSlides"
          :key="item.id"
          class="hero-slide"
          :class="[item.theme, { active: idx === activeSlide }]"
        >
          <img class="hero-photo" :src="item.image" :alt="item.title" />
          <div class="hero-photo-mask"></div>
          <div class="hero-copy">
            <p class="hero-kicker">{{ item.kicker }}</p>
            <h1 class="hero-title">{{ item.title }}</h1>
            <p class="hero-desc">{{ item.desc }}</p>
            <router-link class="hero-cta" to="/products">{{ t.buyNow }}</router-link>
          </div>
        </div>

        <div class="hero-indicators">
          <span
            v-for="(item, idx) in heroSlides"
            :key="`dot-${item.id}`"
            class="hero-indicator"
            :class="{ active: idx === activeSlide }"
            @click="setSlide(idx)"
          ></span>
        </div>
      </div>
    </article>
  </section>

  <section class="mt-24">
    <div class="section-head">
      <h2>{{ t.hotSale }}</h2>
      <router-link class="link-more" to="/products">{{ t.moreHot }}</router-link>
    </div>
    <div v-if="loadingProducts" class="empty page-card">{{ t.loadingProducts }}</div>
    <div v-else class="grid product-grid">
      <ProductCard v-for="item in hotProducts" :key="item.id" :item="normalizeProduct(item)" />
    </div>
  </section>

  <section class="mt-32">
    <div class="section-head">
      <h2>{{ t.lowPrice }}</h2>
      <router-link class="link-more" to="/products">{{ t.viewAll }}</router-link>
    </div>
    <div v-if="loadingProducts" class="empty page-card">{{ t.loadingRecommend }}</div>
    <div v-else class="grid product-grid">
      <ProductCard v-for="item in cheapProducts" :key="item.id" :item="normalizeProduct(item)" />
    </div>
  </section>

  <section v-if="floors.length" class="mt-32">
    <div class="section-head">
      <h2>{{ t.floorTitle }}</h2>
      <router-link class="link-more" to="/products">{{ t.enterCategory }}</router-link>
    </div>
    <div class="floor-list">
      <article v-for="floor in floors" :key="floor.name" class="floor-card page-card">
        <div class="floor-head">
          <h3>{{ floor.name }}</h3>
          <router-link class="link-more" :to="`/products?category=${encodeURIComponent(floor.name)}`">
            {{ t.goShop }}
          </router-link>
        </div>
        <div class="grid floor-grid">
          <ProductCard v-for="item in floor.products" :key="item.id" :item="normalizeProduct(item)" />
        </div>
      </article>
    </div>
  </section>

  <section class="mt-32">
    <div class="section-head">
      <h2>{{ t.news }}</h2>
      <router-link class="link-more" to="/news">{{ t.moreNews }}</router-link>
    </div>
    <div v-if="loadingNews" class="empty page-card">{{ t.loadingNews }}</div>
    <div v-else class="news-grid">
      <article v-for="item in newsList" :key="item.id" class="news-card page-card">
        <img :src="toImageUrl(item.picture)" :alt="zhNewsTitle(item)" />
        <div>
          <h3>{{ zhNewsTitle(item) }}</h3>
          <p>{{ zhNewsIntro(item) }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { api } from "../api/modules";
import ProductCard from "../components/ProductCard.vue";
import { toImageUrl } from "../utils/format";
import { zhCategory, zhNewsIntro, zhNewsTitle, zhProductName } from "../utils/zh";

const t = {
  allCategories: "\u5168\u90e8\u5206\u7c7b",
  viewAllProducts: "\u67e5\u770b\u5168\u90e8\u5546\u54c1",
  activityKicker: "\u9650\u65f6\u6d3b\u52a8",
  buyNow: "\u7acb\u5373\u9009\u8d2d",
  browseNews: "\u6d4f\u89c8\u8d44\u8baf",
  sellingProducts: "\u5728\u552e\u5546\u54c1",
  categoryCount: "\u5546\u54c1\u5206\u7c7b",
  commentCount: "\u7528\u6237\u8bc4\u8bba",
  hotSale: "\u4eca\u65e5\u70ed\u9500",
  moreHot: "\u66f4\u591a\u7206\u6b3e",
  loadingProducts: "\u5546\u54c1\u52a0\u8f7d\u4e2d...",
  lowPrice: "\u4f4e\u4ef7\u63a8\u8350",
  viewAll: "\u67e5\u770b\u5168\u90e8",
  loadingRecommend: "\u63a8\u8350\u52a0\u8f7d\u4e2d...",
  floorTitle: "\u5206\u7c7b\u697c\u5c42",
  enterCategory: "\u8fdb\u5165\u5206\u7c7b\u9875",
  goShop: "\u53bb\u901b\u901b",
  news: "\u5546\u57ce\u8d44\u8baf",
  moreNews: "\u66f4\u591a\u8d44\u8baf",
  loadingNews: "\u8d44\u8baf\u52a0\u8f7d\u4e2d..."
};

const heroSlides = ref([
  {
    id: 1,
    title: "\u6e05\u660e\u6362\u5b63\u4e13\u573a",
    desc: "\u6625\u65b0\u5b63\u8d85\u503c\u4f18\u60e0\uff0c\u670d\u9970\u5bb6\u5c45\u6bcf\u65e5\u4e0a\u65b0\u3002",
    theme: "theme-1",
    kicker: "\u6625\u65e5\u4f1a\u573a",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: 2,
    title: "3C\u6570\u7801\u72c2\u6b22\u8282",
    desc: "\u624b\u673a\u7535\u8111\u9650\u65f6\u76f4\u964d\uff0c\u4ee5\u65e7\u6362\u65b0\u66f4\u7701\u5fc3\u3002",
    theme: "theme-2",
    kicker: "\u6570\u7801\u65b0\u54c1",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: 3,
    title: "\u98df\u54c1\u751f\u9c9c\u65e5",
    desc: "\u6bcf\u65e5\u7206\u6b3e\u4f4e\u81f3 5 \u6298\uff0c\u4eca\u65e5\u8d2d\u4e70\u6b21\u65e5\u8fbe\u3002",
    theme: "theme-3",
    kicker: "\u751f\u9c9c\u4e13\u573a",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80"
  }
]);

const categories = ref([]);
const allProducts = ref([]);
const hotProducts = ref([]);
const newsList = ref([]);
const loadingProducts = ref(false);
const loadingNews = ref(false);
const commentCount = ref(0);
const activeSlide = ref(Math.floor(Math.random() * heroSlides.value.length));
let slideTimer = null;

const productTotal = computed(() => allProducts.value.length || 0);
const categoryTotal = computed(() => categories.value.length || 0);
const commentTotal = computed(() => commentCount.value);

const cheapProducts = computed(() => {
  return [...allProducts.value]
    .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    .slice(0, 8);
});

const floors = computed(() => {
  return categories.value
    .slice(0, 4)
    .map((item) => {
      const name = zhCategory(item.leixing);
      const products = allProducts.value
        .filter((p) => zhCategory(p.shangpinleixing) === name)
        .slice(0, 4);
      return { name, products };
    })
    .filter((item) => item.products.length > 0);
});

const normalizeProduct = (p) => ({
  ...p,
  shangpinleixing: zhCategory(p.shangpinleixing),
  shangpinmingcheng: zhProductName(p)
});

function nextSlide() {
  activeSlide.value = (activeSlide.value + 1) % heroSlides.value.length;
}

function startSlideTimer() {
  slideTimer = setInterval(nextSlide, 4200);
}

function resetSlideTimer() {
  if (slideTimer) clearInterval(slideTimer);
  startSlideTimer();
}

function setSlide(idx) {
  activeSlide.value = idx;
  resetSlideTimer();
}

async function loadCategories() {
  const res = await api.getCategories({ page: 1, limit: 50 });
  categories.value = res.data?.list || [];
}

async function loadProducts() {
  loadingProducts.value = true;
  try {
    const [hotRes, pageRes] = await Promise.all([
      api.getProducts({ page: 1, limit: 8, sort: "clicknum", order: "desc" }),
      api.getProducts({ page: 1, limit: 240, sort: "id", order: "desc" })
    ]);
    hotProducts.value = hotRes.data?.list || [];
    allProducts.value = pageRes.data?.list || [];
  } finally {
    loadingProducts.value = false;
  }
}

async function loadNews() {
  loadingNews.value = true;
  try {
    const res = await api.getNews({ page: 1, limit: 4, sort: "id", order: "desc" });
    newsList.value = res.data?.list || [];
  } finally {
    loadingNews.value = false;
  }
}

async function loadCommentCount() {
  const res = await api.getComments({ page: 1, limit: 1 });
  commentCount.value = Number(res.data?.total || 0);
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadProducts(), loadNews(), loadCommentCount()]);
  startSlideTimer();
});

onBeforeUnmount(() => {
  if (slideTimer) clearInterval(slideTimer);
});
</script>
