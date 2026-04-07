<template>
  <section class="auth-card page-card mt-24 fade-up">
    <h1 class="title">{{ t.title }}</h1>
    <p class="sub">{{ t.sub }}</p>

    <div class="profile-grid mt-16">
      <label class="field">
        <span>{{ t.user }}</span>
        <input v-model.trim="form.zhanghao" class="input" />
      </label>
      <label class="field">
        <span>{{ t.pass }}</span>
        <input v-model.trim="form.mima" type="password" class="input" />
      </label>
      <label class="field">
        <span>{{ t.name }}</span>
        <input v-model.trim="form.xingming" class="input" />
      </label>
      <label class="field">
        <span>{{ t.sex }}</span>
        <select v-model="form.xingbie" class="select">
          <option value="">{{ t.pick }}</option>
          <option :value="t.male">{{ t.male }}</option>
          <option :value="t.female">{{ t.female }}</option>
        </select>
      </label>
      <label class="field">
        <span>{{ t.phone }}</span>
        <input v-model.trim="form.shouji" class="input" />
      </label>
      <label class="field">
        <span>{{ t.mail }}</span>
        <input v-model.trim="form.youxiang" class="input" />
      </label>
    </div>

    <button class="button mt-24" @click="submit">{{ t.submit }}</button>
    <p v-if="message" class="hint mt-16">{{ message }}</p>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api/modules";

const t = {
  title: "\u521b\u5efa\u5546\u57ce\u8d26\u53f7",
  sub: "\u6ce8\u518c\u540e\u5373\u53ef\u4e0b\u5355",
  user: "\u8d26\u53f7",
  pass: "\u5bc6\u7801",
  name: "\u59d3\u540d",
  sex: "\u6027\u522b",
  phone: "\u624b\u673a\u53f7",
  mail: "\u90ae\u7bb1",
  pick: "\u8bf7\u9009\u62e9",
  male: "\u7537",
  female: "\u5973",
  submit: "\u5b8c\u6210\u6ce8\u518c"
};

const router = useRouter();
const message = ref("");
const form = reactive({
  zhanghao: "",
  mima: "",
  xingming: "",
  xingbie: "",
  shouji: "",
  youxiang: "",
  touxiang: "",
  money: 0
});

async function submit() {
  if (!form.zhanghao || !form.mima || !form.xingming) {
    message.value = "\u8d26\u53f7\u3001\u5bc6\u7801\u3001\u59d3\u540d\u4e3a\u5fc5\u586b";
    return;
  }

  try {
    await api.register(form);
    message.value = "\u6ce8\u518c\u6210\u529f";
    setTimeout(() => router.push("/login"), 700);
  } catch (e) {
    message.value = e.message || "\u6ce8\u518c\u5931\u8d25";
  }
}
</script>
