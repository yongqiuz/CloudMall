<template>
  <section class="page-card mt-24 fade-up">
    <h1 class="title">{{ t.title }}</h1>
    <p class="sub">{{ t.sub }}</p>
  </section>

  <section class="page-card mt-24">
    <template v-if="!isAuthed">
      <p class="sub">{{ t.needLogin }}</p>
      <button class="button mt-16" @click="goLogin">{{ t.goLogin }}</button>
    </template>

    <template v-else>
      <div class="admin-topbar">
        <div class="admin-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="ghost-btn"
            :class="{ active: activeTab === tab.key }"
            @click="switchTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="row">
          <button class="button" @click="openCreate">{{ t.create }}</button>
          <button class="ghost-btn" @click="logoutAdmin">{{ t.logout }}</button>
        </div>
      </div>

      <div class="admin-table-wrap mt-16">
        <table class="admin-table">
          <thead>
            <tr>
              <th v-for="col in currentCols" :key="col.key">{{ col.label }}</th>
              <th>{{ t.action }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="currentCols.length + 1">{{ t.loading }}</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td :colspan="currentCols.length + 1">{{ t.empty }}</td>
            </tr>
            <tr v-else v-for="row in rows" :key="row.id">
              <td v-for="col in currentCols" :key="`${row.id}-${col.key}`">
                <img v-if="col.type === 'image' && showImage(row[col.key])" :src="showImage(row[col.key])" class="admin-thumb" />
                <span v-else>{{ showVal(row[col.key]) }}</span>
              </td>
              <td>
                <div class="row">
                  <button class="ghost-btn" @click="openEdit(row)">{{ t.edit }}</button>
                  <button class="button alt mini" @click="removeRow(row.id)">{{ t.delete }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager mt-16">
        <button class="ghost-btn" :disabled="pager.page <= 1" @click="changePage(pager.page - 1)">{{ t.prev }}</button>
        <span>{{ t.page }} {{ pager.page }} / {{ pager.totalPage || 1 }}</span>
        <button class="ghost-btn" :disabled="pager.page >= (pager.totalPage || 1)" @click="changePage(pager.page + 1)">
          {{ t.next }}
        </button>
      </div>

      <p v-if="message" class="hint mt-16">{{ message }}</p>
    </template>
  </section>

  <section v-if="dialog.open" class="page-card mt-24">
    <div class="section-head">
      <h2>{{ dialog.mode === "create" ? t.create : t.edit }}</h2>
      <button class="ghost-btn" @click="closeDialog">{{ t.close }}</button>
    </div>

    <div class="profile-grid mt-16">
      <label v-for="f in currentFormFields" :key="f.key" class="field">
        <span>{{ f.label }}</span>
        <textarea v-if="f.type === 'textarea'" v-model="dialog.model[f.key]" class="textarea" rows="3"></textarea>
        <input
          v-else-if="f.type !== 'number'"
          v-model="dialog.model[f.key]"
          class="input"
          :type="f.type === 'date' ? 'date' : 'text'"
        />
        <input v-else v-model.number="dialog.model[f.key]" class="input" type="number" step="0.01" />
        <div v-if="f.key === 'shangpintupian'" class="row mt-16">
          <button class="ghost-btn" type="button" @click="triggerImageUpload">{{ t.uploadImage }}</button>
          <span class="sub">{{ t.uploadHint }}</span>
        </div>
        <input ref="uploadInputRef" type="file" accept="image/*" class="hidden-input" @change="onFilePicked" />
        <img v-if="f.key === 'shangpintupian' && showImage(dialog.model[f.key])" :src="showImage(dialog.model[f.key])" class="admin-preview" />
      </label>
    </div>

    <button class="button mt-24" @click="submitDialog">{{ t.save }}</button>
  </section>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { toImageUrl } from "../utils/format";

const t = {
  title: "\u7ba1\u7406\u540e\u53f0",
  sub: "\u7528\u4e8e\u7edf\u4e00\u7ba1\u7406\u7528\u6237\u3001\u5546\u54c1\u4e0e\u5206\u7c7b\u6570\u636e",
  needLogin: "\u8bf7\u5148\u5728\u7edf\u4e00\u767b\u5f55\u9875\u5b8c\u6210\u7ba1\u7406\u5458\u767b\u5f55",
  goLogin: "\u53bb\u767b\u5f55\u9875",
  logout: "\u9000\u51fa\u540e\u53f0",
  create: "\u65b0\u5efa",
  edit: "\u7f16\u8f91",
  delete: "\u5220\u9664",
  action: "\u64cd\u4f5c",
  save: "\u4fdd\u5b58",
  close: "\u5173\u95ed",
  uploadImage: "\u70b9\u51fb\u4e0a\u4f20\u56fe\u7247",
  uploadHint: "\u4e0a\u4f20\u540e\u4f1a\u81ea\u52a8\u56de\u586b\u56fe\u7247\u5730\u5740",
  empty: "\u6682\u65e0\u6570\u636e",
  loading: "\u52a0\u8f7d\u4e2d...",
  prev: "\u4e0a\u4e00\u9875",
  next: "\u4e0b\u4e00\u9875",
  page: "\u7b2c"
};

const API_BASE = import.meta.env.VITE_API_BASE || "/springcloudk02l8";
const ADMIN_TOKEN_KEY = "mall_admin_token";

const tabs = [
  { key: "yonghu", label: "\u524d\u53f0\u7528\u6237", endpoint: "/yonghu" },
  { key: "product", label: "\u5546\u54c1\u7ba1\u7406", endpoint: "/shangpinxinxi" },
  { key: "category", label: "\u5206\u7c7b\u7ba1\u7406", endpoint: "/shangpinfenlei" }
];

const columnsMap = {
  yonghu: [
    { key: "id", label: "ID" },
    { key: "zhanghao", label: "\u8d26\u53f7" },
    { key: "xingming", label: "\u59d3\u540d" },
    { key: "shouji", label: "\u624b\u673a" },
    { key: "money", label: "\u4f59\u989d" }
  ],
  product: [
    { key: "id", label: "ID" },
    { key: "shangpintupian", label: "\u5546\u54c1\u56fe\u7247", type: "image" },
    { key: "shangpinmingcheng", label: "\u5546\u54c1\u540d\u79f0" },
    { key: "shangpinleixing", label: "\u5206\u7c7b" },
    { key: "price", label: "\u4ef7\u683c" },
    { key: "alllimittimes", label: "\u5e93\u5b58" }
  ],
  category: [
    { key: "id", label: "ID" },
    { key: "leixing", label: "\u5206\u7c7b\u540d\u79f0" },
    { key: "addtime", label: "\u521b\u5efa\u65f6\u95f4" }
  ]
};

const formFieldsMap = {
  yonghu: [
    { key: "zhanghao", label: "\u8d26\u53f7" },
    { key: "mima", label: "\u5bc6\u7801" },
    { key: "xingming", label: "\u59d3\u540d" },
    { key: "xingbie", label: "\u6027\u522b" },
    { key: "shouji", label: "\u624b\u673a" },
    { key: "youxiang", label: "\u90ae\u7bb1" },
    { key: "money", label: "\u4f59\u989d", type: "number" }
  ],
  product: [
    { key: "shangpinmingcheng", label: "\u5546\u54c1\u540d\u79f0" },
    { key: "shangpinleixing", label: "\u5546\u54c1\u5206\u7c7b" },
    { key: "guige", label: "\u89c4\u683c" },
    { key: "price", label: "\u4ef7\u683c", type: "number" },
    { key: "alllimittimes", label: "\u5e93\u5b58", type: "number" },
    { key: "shangpintupian", label: "\u56fe\u7247URL" },
    { key: "shangpinjieshao", label: "\u5546\u54c1\u4ecb\u7ecd", type: "textarea" }
  ],
  category: [{ key: "leixing", label: "\u5206\u7c7b\u540d\u79f0" }]
};

const router = useRouter();
const adminToken = ref(localStorage.getItem(ADMIN_TOKEN_KEY) || "");
const isAuthed = computed(() => Boolean(adminToken.value));
const activeTab = ref("yonghu");
const rows = ref([]);
const loading = ref(false);
const message = ref("");
const uploadInputRef = ref(null);
const pager = reactive({ page: 1, limit: 10, totalPage: 1 });

const dialog = reactive({
  open: false,
  mode: "create",
  model: {}
});

const currentCols = computed(() => columnsMap[activeTab.value] || []);
const currentFormFields = computed(() => formFieldsMap[activeTab.value] || []);
const currentEndpoint = computed(() => tabs.find((t1) => t1.key === activeTab.value)?.endpoint || "/yonghu");

const adminHttp = axios.create({ baseURL: API_BASE, timeout: 15000 });

adminHttp.interceptors.request.use((config) => {
  if (adminToken.value) {
    config.headers.Token = adminToken.value;
  }
  return config;
});

adminHttp.interceptors.response.use(
  (resp) => {
    if (typeof resp.data?.code !== "undefined" && resp.data.code !== 0) {
      return Promise.reject(new Error(resp.data.msg || "\u64cd\u4f5c\u5931\u8d25"));
    }
    return resp.data;
  },
  (e) => Promise.reject(new Error(e?.response?.data?.msg || e.message || "\u7f51\u7edc\u5f02\u5e38"))
);

function showVal(v) {
  if (v === null || typeof v === "undefined" || v === "") return "-";
  return String(v);
}

function showImage(v) {
  if (!v) return "";
  return toImageUrl(v);
}

function triggerImageUpload() {
  uploadInputRef.value?.click();
}

async function onFilePicked(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await adminHttp.post("/file/upload", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    dialog.model.shangpintupian = res.file;
    message.value = "\u56fe\u7247\u4e0a\u4f20\u6210\u529f";
  } catch (e) {
    message.value = e.message;
  } finally {
    event.target.value = "";
  }
}

function goLogin() {
  router.push({ name: "login", query: { type: "admin" } });
}

function logoutAdmin() {
  adminToken.value = "";
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  rows.value = [];
}

async function fetchRows(page = pager.page) {
  if (!isAuthed.value) return;
  loading.value = true;
  try {
    const res = await adminHttp.get(`${currentEndpoint.value}/page`, {
      params: { page, limit: pager.limit, sort: "id", order: "desc" }
    });
    rows.value = res.data?.list || [];
    pager.page = Number(res.data?.currPage || page);
    pager.totalPage = Number(res.data?.totalPage || 1);
  } catch (e) {
    message.value = e.message;
  } finally {
    loading.value = false;
  }
}

function switchTab(tab) {
  activeTab.value = tab;
  fetchRows(1);
}

function changePage(page) {
  fetchRows(page);
}

function openCreate() {
  dialog.mode = "create";
  dialog.model = {};
  dialog.open = true;
}

function openEdit(row) {
  dialog.mode = "edit";
  dialog.model = { ...row };
  dialog.open = true;
}

function closeDialog() {
  dialog.open = false;
  dialog.model = {};
}

async function submitDialog() {
  try {
    const endpoint = dialog.mode === "create" ? "/save" : "/update";
    await adminHttp.post(`${currentEndpoint.value}${endpoint}`, dialog.model);
    closeDialog();
    await fetchRows(pager.page);
  } catch (e) {
    message.value = e.message;
  }
}

async function removeRow(id) {
  try {
    await adminHttp.post(`${currentEndpoint.value}/delete`, [id]);
    await fetchRows(1);
  } catch (e) {
    message.value = e.message;
  }
}

onMounted(() => {
  if (isAuthed.value) fetchRows(1);
});
</script>
