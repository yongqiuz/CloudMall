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
          <img class="hero-slide-image" :src="item.image" :alt="item.title" />
          <p class="hero-kicker">{{ t.activityKicker }}</p>
          <h1 class="hero-title">{{ item.title }}</h1>
          <p class="hero-desc">{{ item.desc }}</p>
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
    image: ""
  },
  {
    id: 2,
    title: "3C\u6570\u7801\u72c2\u6b22\u8282",
    desc: "\u624b\u673a\u7535\u8111\u9650\u65f6\u76f4\u964d\uff0c\u4ee5\u65e7\u6362\u65b0\u66f4\u7701\u5fc3\u3002",
    theme: "theme-2",
    image: ""
  },
  {
    id: 3,
    title: "\u98df\u54c1\u751f\u9c9c\u65e5",
    desc: "\u6bcf\u65e5\u7206\u6b3e\u4f4e\u81f3 5 \u6298\uff0c\u4eca\u65e5\u8d2d\u4e70\u6b21\u65e5\u8fbe\u3002",
    theme: "theme-3",
    image: ""
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

function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
}

function createHeroImage(seed, width = 1000, height = 450) {
  const rand = seededRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const greenA = `hsl(${150 + Math.floor(rand() * 18)} 55% 38%)`;
  const greenB = `hsl(${165 + Math.floor(rand() * 18)} 60% 30%)`;
  const orangeA = `hsl(${20 + Math.floor(rand() * 18)} 92% 52%)`;
  const orangeB = `hsl(${28 + Math.floor(rand() * 16)} 92% 46%)`;

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, greenA);
  bg.addColorStop(0.55, greenB);
  bg.addColorStop(1, orangeA);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 10; i += 1) {
    const r = Math.floor(60 + rand() * 160);
    const x = Math.floor(rand() * width);
    const y = Math.floor(rand() * height);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.22)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.globalAlpha = 0.18;
  for (let i = 0; i < 8; i += 1) {
    const w = 220 + Math.floor(rand() * 260);
    const h = 90 + Math.floor(rand() * 140);
    const x = Math.floor(rand() * (width - w));
    const y = Math.floor(rand() * (height - h));
    const radius = 26;
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.9)" : "rgba(15,23,42,0.85)";
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = orangeB;
  ctx.beginPath();
  roundRectPath(ctx, width * 0.08, height * 0.14, width * 0.34, height * 0.14, 36);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = "700 56px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  ctx.textBaseline = "middle";
  ctx.fillText("FLASH SALE", width * 0.11, height * 0.21);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 34px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  const badges = ["FREE SHIPPING", "COUPON", "NEW ARRIVALS", "TOP PICKS"];
  const badge = badges[Math.floor(rand() * badges.length)];
  ctx.fillText(badge, width * 0.11, height * 0.33);

  ctx.fillStyle = "rgba(15,23,42,0.32)";
  ctx.beginPath();
  roundRectPath(ctx, width * 0.62, height * 0.18, width * 0.28, height * 0.56, 44);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.86)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  roundRectPath(ctx, width * 0.67, height * 0.26, width * 0.18, height * 0.36, 38);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.beginPath();
  ctx.arc(width * 0.72, height * 0.64, 16, 0, Math.PI * 2);
  ctx.arc(width * 0.82, height * 0.64, 16, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL("image/png");
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

  heroSlides.value = heroSlides.value.map((item, idx) => ({
    ...item,
    image: createHeroImage(Date.now() + item.id * 97 + idx * 193)
  }));

  startSlideTimer();
});

onBeforeUnmount(() => {
  if (slideTimer) clearInterval(slideTimer);
});
</script>
