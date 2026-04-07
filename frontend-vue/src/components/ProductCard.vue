<template>
  <article class="product-card fade-up">
    <router-link class="image-wrap" :to="`/products/${item.id}`">
      <img :src="toImageUrl(item.shangpintupian)" :alt="zhProductName(item)" class="cover" />
      <span class="tag">{{ zhCategory(item.shangpinleixing) }}</span>
    </router-link>
    <div class="product-body">
      <router-link class="name" :to="`/products/${item.id}`">{{ zhProductName(item) }}</router-link>
      <p class="meta">{{ t.spec }}{{ zhSpec(item) }} · {{ t.stock }}{{ item.alllimittimes || 0 }}</p>
      <div class="row product-foot">
        <strong class="price">{{ money(item.price) }}</strong>
        <router-link class="button mini" :to="`/products/${item.id}`">{{ t.detail }}</router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
import { money, toImageUrl } from "../utils/format";
import { zhCategory, zhProductName, zhSpec } from "../utils/zh";

defineProps({
  item: {
    type: Object,
    required: true
  }
});

const t = {
  spec: "\u89c4\u683c\uff1a",
  defaultSpec: "\u6807\u51c6\u6b3e",
  stock: "\u5e93\u5b58\uff1a",
  detail: "\u67e5\u770b\u8be6\u60c5"
};
</script>
