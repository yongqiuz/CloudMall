<template>
  <section v-if="product" class="page-card mt-24 fade-up detail-layout">
    <img class="preview" :src="toImageUrl(product.shangpintupian)" :alt="zhProductName(product)" />
    <div>
      <h1 class="title">{{ zhProductName(product) }}</h1>
      <p class="sub">{{ zhCategory(product.shangpinleixing) }} · {{ zhSpec(product) }}</p>
      <p class="price-main">{{ money(product.price) }}</p>
      <div class="detail-meta mt-16">
        <span>{{ t.stock }}{{ product.alllimittimes || 0 }}</span>
        <span>{{ t.click }}{{ product.clicknum || 0 }}</span>
      </div>
      <div class="desc-box" v-html="safeDesc(product.shangpinjieshao)"></div>
      <div class="row mt-16">
        <input v-model.number="count" type="number" min="1" class="input qty" />
        <button class="button" @click="addCart">{{ t.addCart }}</button>
        <button class="button alt" @click="buyNow">{{ t.buyNow }}</button>
      </div>
      <p v-if="message" class="hint mt-16">{{ message }}</p>
    </div>
  </section>

  <section v-else class="page-card mt-24 empty">{{ t.notFound }}</section>

  <section class="page-card mt-24">
    <div class="section-head">
      <h2>{{ t.comment }}</h2>
      <span class="sub">{{ comments.length }} {{ t.commentCount }}</span>
    </div>

    <div v-if="comments.length" class="comment-list">
      <article v-for="item in comments" :key="item.id" class="comment-item">
        <div class="comment-user">{{ zhNickname(item) }}</div>
        <p>{{ zhCommentContent(item) }}</p>
        <p v-if="item.reply" class="reply-text">{{ t.reply }}{{ item.reply }}</p>
      </article>
    </div>
    <div v-else class="empty">{{ t.noComment }}</div>

    <div v-if="userStore.isLoggedIn" class="mt-16">
      <textarea v-model.trim="commentContent" class="textarea" rows="3" :placeholder="t.commentPh"></textarea>
      <button class="button mt-16" @click="submitComment">{{ t.submitComment }}</button>
    </div>
    <p v-else class="sub mt-16">{{ t.loginFirst }}</p>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api/modules";
import { useUserStore } from "../stores/user";
import { money, toImageUrl } from "../utils/format";
import { isBrokenText, zhCategory, zhCommentContent, zhNickname, zhProductName, zhSpec } from "../utils/zh";

const t = {
  std: "\u6807\u51c6\u6b3e",
  stock: "\u5e93\u5b58\uff1a",
  click: "\u6d4f\u89c8\uff1a",
  noDesc: "\u6682\u65e0\u5546\u54c1\u4ecb\u7ecd",
  addCart: "\u52a0\u5165\u8d2d\u7269\u8f66",
  buyNow: "\u7acb\u5373\u8d2d\u4e70",
  notFound: "\u5546\u54c1\u4e0d\u5b58\u5728\u6216\u5df2\u4e0b\u67b6",
  comment: "\u7528\u6237\u8bc4\u4ef7",
  commentCount: "\u6761\u8bc4\u8bba",
  reply: "\u5546\u5bb6\u56de\u590d\uff1a",
  noComment: "\u6682\u65f6\u8fd8\u6ca1\u6709\u8bc4\u4ef7",
  commentPh: "\u5206\u4eab\u4f60\u7684\u8d2d\u7269\u4f53\u9a8c",
  submitComment: "\u53d1\u5e03\u8bc4\u8bba",
  loginFirst: "\u767b\u5f55\u540e\u53ef\u53d1\u5e03\u8bc4\u8bba"
};

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const product = ref(null);
const count = ref(1);
const message = ref("");
const commentContent = ref("");
const comments = ref([]);

function requireLogin() {
  if (userStore.isLoggedIn) return true;
  router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
  return false;
}

function createOrderPayload() {
  const amount = Number(product.value.price || 0) * Number(count.value || 1);
  return {
    orderid: `OD${Date.now()}${Math.floor(Math.random() * 900) + 100}`,
    tablename: "shangpinxinxi",
    userid: userStore.user?.id,
    goodid: product.value.id,
    goodname: zhProductName(product.value),
    picture: product.value.shangpintupian,
    buynumber: count.value,
    price: product.value.price,
    discountprice: product.value.price,
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

async function loadProduct() {
  const r = await api.getProductDetail(route.params.id);
  product.value = r.data;
}

async function loadComments() {
  const r = await api.getComments({ page: 1, limit: 30, refid: route.params.id, sort: "id", order: "desc" });
  comments.value = r.data?.list || [];
}

function safeDesc(text) {
  if (!text || isBrokenText(text)) return `<p>${t.noDesc}</p>`;
  return text;
}

async function addCart() {
  if (!requireLogin()) return;
  await api.addToCart({
    tablename: "shangpinxinxi",
    userid: userStore.user?.id,
    goodid: product.value.id,
    goodname: zhProductName(product.value),
    picture: product.value.shangpintupian,
    buynumber: count.value,
    price: product.value.price,
    discountprice: product.value.price
  });
  message.value = "\u5df2\u52a0\u5165\u8d2d\u7269\u8f66";
}

async function buyNow() {
  if (!requireLogin()) return;
  await api.createOrder(createOrderPayload());
  router.push("/orders");
}

async function submitComment() {
  if (!requireLogin()) return;
  if (!commentContent.value) {
    message.value = "\u8bc4\u8bba\u5185\u5bb9\u4e0d\u80fd\u4e3a\u7a7a";
    return;
  }

  await api.addComment({
    refid: product.value.id,
    userid: userStore.user?.id,
    nickname: userStore.user?.xingming || userStore.user?.zhanghao || "\u7528\u6237",
    content: commentContent.value,
    reply: ""
  });
  commentContent.value = "";
  await loadComments();
}

onMounted(async () => {
  await Promise.all([loadProduct(), loadComments()]);
});
</script>
