<template>
  <section class="page-card mt-24 fade-up">
    <h1 class="title">{{ t.title }}</h1>
    <p class="sub">{{ t.sub }}</p>

    <div class="profile-grid mt-16">
      <label class="field">
        <span>{{ t.user }}</span>
        <input v-model="model.zhanghao" class="input" disabled />
      </label>

      <label class="field">
        <span>{{ t.name }}</span>
        <input v-model.trim="model.xingming" class="input" />
      </label>

      <label class="field">
        <span>{{ t.sex }}</span>
        <select v-model="model.xingbie" class="select">
          <option value="">{{ t.pick }}</option>
          <option :value="t.male">{{ t.male }}</option>
          <option :value="t.female">{{ t.female }}</option>
          <option :value="t.unknown">{{ t.unknown }}</option>
        </select>
      </label>

      <label class="field">
        <span>{{ t.phone }}</span>
        <input v-model.trim="model.shouji" class="input" />
      </label>

      <label class="field">
        <span>{{ t.mail }}</span>
        <input v-model.trim="model.youxiang" class="input" />
      </label>

      <label class="field">
        <span>{{ t.money }}</span>
        <input :value="money(model.money)" class="input" disabled />
      </label>
    </div>

    <button class="button mt-24" @click="save">{{ t.save }}</button>
    <p v-if="message" class="hint mt-16">{{ message }}</p>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { api } from "../api/modules";
import { useUserStore } from "../stores/user";
import { money } from "../utils/format";

const t = {
  title: "\u4e2a\u4eba\u8d44\u6599",
  sub: "\u5b8c\u5584\u4e2a\u4eba\u4fe1\u606f",
  user: "\u8d26\u53f7",
  name: "\u59d3\u540d",
  sex: "\u6027\u522b",
  phone: "\u624b\u673a\u53f7",
  mail: "\u90ae\u7bb1",
  money: "\u8d26\u6237\u4f59\u989d",
  save: "\u4fdd\u5b58\u8d44\u6599",
  pick: "\u8bf7\u9009\u62e9",
  male: "\u7537",
  female: "\u5973",
  unknown: "\u672a\u77e5"
};

const userStore = useUserStore();
const message = ref("");
const model = reactive({});

async function syncUser() {
  const r = await api.getSession();
  Object.assign(model, r.data);
  userStore.setUser(r.data);
}

async function save() {
  await api.updateProfile(model);
  await syncUser();
  message.value = "\u4fdd\u5b58\u6210\u529f";
}

onMounted(syncUser);
</script>
