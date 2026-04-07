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

    <div class="profile-actions mt-24">
      <button class="button" @click="save">{{ t.save }}</button>
      <button class="ghost-btn" @click="togglePasswordPanel">
        {{ showPasswordPanel ? t.cancelPassword : t.changePassword }}
      </button>
    </div>

    <form v-if="showPasswordPanel" class="password-panel mt-16" @submit.prevent="changePassword">
      <PasswordInput
        v-model="passwordForm.oldPassword"
        :label="t.oldPassword"
        :placeholder="t.oldPasswordPh"
        autocomplete="current-password"
      />
      <PasswordInput
        v-model="passwordForm.newPassword"
        :label="t.newPassword"
        :placeholder="t.newPasswordPh"
        autocomplete="new-password"
        :show-strength="true"
      />
      <PasswordInput
        v-model="passwordForm.confirmPassword"
        :label="t.confirmPassword"
        :placeholder="t.confirmPasswordPh"
        autocomplete="new-password"
      />
      <button class="button alt" type="submit">{{ t.confirmChange }}</button>
    </form>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { api } from "../api/modules";
import { useUserStore } from "../stores/user";
import { money } from "../utils/format";
import PasswordInput from "../components/PasswordInput.vue";
import { showNotice } from "../utils/notice";
import { validatePassword } from "../utils/password";

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
  changePassword: "\u4fee\u6539\u5bc6\u7801",
  cancelPassword: "\u6536\u8d77\u4fee\u6539\u5bc6\u7801",
  oldPassword: "\u539f\u5bc6\u7801",
  newPassword: "\u65b0\u5bc6\u7801",
  confirmPassword: "\u786e\u8ba4\u65b0\u5bc6\u7801",
  confirmChange: "\u786e\u8ba4\u4fee\u6539",
  oldPasswordPh: "\u8bf7\u8f93\u5165\u539f\u5bc6\u7801",
  newPasswordPh: "\u8bf7\u8f93\u5165 6-12 \u4f4d\u5bc6\u7801",
  confirmPasswordPh: "\u8bf7\u91cd\u590d\u8f93\u5165\u65b0\u5bc6\u7801",
  pick: "\u8bf7\u9009\u62e9",
  male: "\u7537",
  female: "\u5973",
  unknown: "\u672a\u77e5"
};

const userStore = useUserStore();
const showPasswordPanel = ref(false);
const model = reactive({});
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

function resetPasswordForm() {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
}

function togglePasswordPanel() {
  showPasswordPanel.value = !showPasswordPanel.value;
  resetPasswordForm();
}

async function syncUser() {
  const r = await api.getSession();
  Object.assign(model, r.data);
  userStore.setUser(r.data);
}

async function save() {
  try {
    const payload = { ...model };
    delete payload.mima;
    await api.updateProfile(payload);
    await syncUser();
    showNotice("\u4fdd\u5b58\u6210\u529f", "success");
  } catch (error) {
    showNotice(error.message || "\u4fdd\u5b58\u5931\u8d25");
  }
}

async function changePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    showNotice("\u8bf7\u586b\u5199\u5b8c\u6574\u7684\u5bc6\u7801\u4fe1\u606f");
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showNotice("\u4e24\u6b21\u8f93\u5165\u7684\u65b0\u5bc6\u7801\u4e0d\u4e00\u81f4");
    return;
  }
  const passwordError = validatePassword(passwordForm.newPassword);
  if (passwordError) {
    showNotice(passwordError);
    return;
  }

  try {
    await api.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    await syncUser();
    resetPasswordForm();
    showPasswordPanel.value = false;
    showNotice("\u5bc6\u7801\u4fee\u6539\u6210\u529f\uff0c\u4e0b\u6b21\u767b\u5f55\u8bf7\u4f7f\u7528\u65b0\u5bc6\u7801", "success");
  } catch (error) {
    showNotice(error.message || "\u5bc6\u7801\u4fee\u6539\u5931\u8d25");
  }
}

onMounted(syncUser);
</script>
