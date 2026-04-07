<template>
  <section v-if="!isAuthed" class="page-card mt-24 fade-up admin-login">
    <h1 class="title">管理员后台</h1>
    <p class="sub">请先在统一登录页选择“管理员登录”，登录成功后进入独立后台系统。</p>
    <button class="button mt-16" @click="goLogin">去登录页</button>
  </section>

  <section v-else class="admin-shell fade-up">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <span class="logo-dot"></span>
        <div>
          <strong>CloudMall 管理端</strong>
          <small>运营后台系统</small>
        </div>
      </div>
      <button
        v-for="module in modules"
        :key="module.key"
        class="admin-menu-item"
        :class="{ active: activeModule === module.key }"
        @click="switchModule(module.key)"
      >
        <span>{{ module.icon }}</span>
        {{ module.label }}
      </button>
    </aside>

    <main class="admin-workspace">
      <div class="admin-hero">
        <div>
          <p class="hero-kicker">ADMIN CENTER</p>
          <h1>{{ currentModule.label }}</h1>
          <p>{{ currentModule.desc }}</p>
        </div>
        <div class="row">
          <router-link class="ghost-btn" to="/">返回商城首页</router-link>
          <button class="button alt" @click="logoutAdmin">退出后台</button>
        </div>
      </div>

      <section v-if="activeModule === 'home'" class="admin-dashboard">
        <article v-for="card in dashboardCards" :key="card.label" class="admin-stat-card">
          <span>{{ card.icon }}</span>
          <strong>{{ card.value }}</strong>
          <p>{{ card.label }}</p>
        </article>
      </section>

      <section v-else-if="activeModule === 'profile'" class="page-card">
        <div class="section-head">
          <h2>个人中心</h2>
          <button class="button" @click="saveAdminProfile">保存资料</button>
        </div>
        <div class="profile-grid mt-16">
          <label v-for="field in profileFields" :key="field.key" class="field">
            <span>{{ field.label }}</span>
            <input v-model.trim="adminProfile[field.key]" class="input" :type="field.type || 'text'" />
          </label>
        </div>
      </section>

      <section v-else class="page-card">
        <div class="admin-topbar">
          <div>
            <h2 class="admin-section-title">{{ currentModule.label }}</h2>
            <p class="sub">{{ currentModule.tableHint }}</p>
          </div>
          <div class="row">
            <button v-if="currentModule.creatable !== false" class="button" @click="openCreate">新增</button>
            <button class="ghost-btn" @click="fetchRows(1)">刷新</button>
          </div>
        </div>

        <div class="admin-table-wrap mt-16">
          <table class="admin-table">
            <thead>
              <tr>
                <th v-for="col in currentCols" :key="col.key">{{ col.label }}</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td :colspan="currentCols.length + 1">加载中...</td>
              </tr>
              <tr v-else-if="!rows.length">
                <td :colspan="currentCols.length + 1">暂无数据</td>
              </tr>
              <tr v-else v-for="(row, index) in rows" :key="row.id || index">
                <td v-for="col in currentCols" :key="`${row.id || index}-${col.key}`">
                  <span v-if="col.type === 'index'">{{ (pager.page - 1) * pager.limit + index + 1 }}</span>
                  <img v-else-if="col.type === 'image' && showImage(row[col.key])" :src="showImage(row[col.key])" class="admin-thumb" />
                  <span v-else>{{ showVal(row[col.key]) }}</span>
                </td>
                <td>
                  <div class="row">
                    <button class="ghost-btn" @click="openDetail(row)">详情</button>
                    <button v-if="activeModule === 'product'" class="ghost-btn" @click="openComments(row)">查看评论</button>
                    <button class="ghost-btn" @click="openEdit(row)">修改</button>
                    <button class="button alt mini" @click="removeRow(row.id)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pager mt-16">
          <button class="ghost-btn" :disabled="pager.page <= 1" @click="changePage(pager.page - 1)">上一页</button>
          <span>第 {{ pager.page }} / {{ pager.totalPage || 1 }} 页</span>
          <button class="ghost-btn" :disabled="pager.page >= (pager.totalPage || 1)" @click="changePage(pager.page + 1)">
            下一页
          </button>
        </div>
      </section>

      <p v-if="message" class="hint mt-16" :class="{ error: isError }">{{ message }}</p>
    </main>
  </section>

  <section v-if="dialog.open" class="admin-modal">
    <div class="admin-modal-card page-card">
      <div class="section-head">
        <h2>{{ dialogTitle }}</h2>
        <button class="ghost-btn" @click="closeDialog">关闭</button>
      </div>

      <div v-if="dialog.mode === 'detail'" class="admin-detail-grid mt-16">
        <div v-for="field in detailFields" :key="field.key" class="detail-cell">
          <span>{{ field.label }}</span>
          <img v-if="field.type === 'image' && showImage(dialog.model[field.key])" :src="showImage(dialog.model[field.key])" class="admin-preview" />
          <strong v-else>{{ showVal(dialog.model[field.key]) }}</strong>
        </div>
      </div>

      <div v-else-if="dialog.mode === 'comments'" class="comment-list mt-16">
        <article v-if="!comments.length" class="comment-item">暂无评论</article>
        <article v-for="comment in comments" :key="comment.id" class="comment-item">
          <strong>{{ showVal(comment.nickname) }}</strong>
          <p>{{ showVal(comment.content) }}</p>
          <label class="field mt-16">
            <span>管理员回复</span>
            <textarea v-model="comment.reply" class="textarea" rows="2"></textarea>
          </label>
          <button class="ghost-btn mt-16" @click="saveCommentReply(comment)">保存回复</button>
        </article>
      </div>

      <div v-else class="profile-grid mt-16">
        <label v-for="field in currentFormFields" :key="field.key" class="field">
          <span>{{ field.label }}</span>
          <textarea v-if="field.type === 'textarea'" v-model="dialog.model[field.key]" class="textarea" rows="4"></textarea>
          <input
            v-else
            v-model="dialog.model[field.key]"
            class="input"
            :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
            :step="field.type === 'number' ? '0.01' : undefined"
          />
          <div v-if="field.type === 'image'" class="row mt-16">
            <button class="ghost-btn" type="button" @click="triggerImageUpload(field.key)">点击上传图片</button>
            <span class="sub">上传成功后自动回填图片地址</span>
          </div>
          <img v-if="field.type === 'image' && showImage(dialog.model[field.key])" :src="showImage(dialog.model[field.key])" class="admin-preview" />
        </label>
      </div>

      <input ref="uploadInputRef" type="file" accept="image/*" class="hidden-input" @change="onFilePicked" />
      <button v-if="dialog.mode !== 'detail' && dialog.mode !== 'comments'" class="button mt-24" @click="submitDialog">保存</button>
    </div>
  </section>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { toImageUrl } from "../utils/format";
import { showNotice } from "../utils/notice";

const API_BASE = import.meta.env.VITE_API_BASE || "/springcloudk02l8";
const ADMIN_TOKEN_KEY = "mall_admin_token";

const modules = [
  { key: "home", label: "首页", icon: "🏠", desc: "商城运营数据总览，快速掌握核心状态。" },
  { key: "profile", label: "个人中心", icon: "👤", desc: "维护当前管理员账号资料。" },
  { key: "users", label: "用户管理", icon: "👥", endpoint: "/yonghu", desc: "管理前台用户资料。", tableHint: "支持详情、修改、删除用户信息。" },
  { key: "product", label: "商品信息管理", icon: "🛍️", endpoint: "/shangpinxinxi", desc: "管理商品信息、库存与评论。", tableHint: "支持详情、查看评论、修改、删除商品。" },
  { key: "category", label: "商品分类管理", icon: "🏷️", endpoint: "/shangpinfenlei", desc: "维护商城商品分类。", tableHint: "支持修改或删除分类。" },
  { key: "news", label: "购物资讯", icon: "📰", endpoint: "/news", desc: "维护购物资讯内容。", tableHint: "支持详情、修改、删除资讯。" },
  { key: "carousel", label: "轮播图管理", icon: "🖼️", endpoint: "/config", desc: "维护首页轮播图配置。", tableHint: "通过配置项管理轮播图资源。" },
  { key: "orders", label: "订单管理", icon: "📦", endpoint: "/orders", desc: "管理用户订单和物流状态。", tableHint: "支持详情、修改、删除订单。", creatable: false }
];

const columnsMap = {
  users: [
    { key: "__index", label: "索引", type: "index" },
    { key: "zhanghao", label: "账号" },
    { key: "xingming", label: "姓名" },
    { key: "xingbie", label: "性别" },
    { key: "shouji", label: "手机" },
    { key: "youxiang", label: "邮箱" },
    { key: "touxiang", label: "头像", type: "image" }
  ],
  product: [
    { key: "__index", label: "索引", type: "index" },
    { key: "shangpinmingcheng", label: "商品名称" },
    { key: "shangpinleixing", label: "商品类型" },
    { key: "guige", label: "规格" },
    { key: "shangjiashijian", label: "上架时间" },
    { key: "shangpintupian", label: "商品图片", type: "image" },
    { key: "price", label: "价格" },
    { key: "onelimittimes", label: "单限" },
    { key: "alllimittimes", label: "库存" }
  ],
  category: [
    { key: "__index", label: "索引", type: "index" },
    { key: "leixing", label: "类型" }
  ],
  news: [
    { key: "__index", label: "索引", type: "index" },
    { key: "title", label: "标题" },
    { key: "picture", label: "图片", type: "image" },
    { key: "introduction", label: "简介" }
  ],
  carousel: [
    { key: "__index", label: "索引", type: "index" },
    { key: "name", label: "配置名称" },
    { key: "value", label: "图片/配置值", type: "image" }
  ],
  orders: [
    { key: "__index", label: "索引", type: "index" },
    { key: "orderid", label: "订单号" },
    { key: "goodname", label: "商品名称" },
    { key: "picture", label: "商品图片", type: "image" },
    { key: "buynumber", label: "数量" },
    { key: "price", label: "单价" },
    { key: "total", label: "总价" },
    { key: "status", label: "订单状态" },
    { key: "logistics", label: "物流" }
  ]
};

const formFieldsMap = {
  users: [
    { key: "zhanghao", label: "账号" },
    { key: "mima", label: "密码" },
    { key: "xingming", label: "姓名" },
    { key: "xingbie", label: "性别" },
    { key: "shouji", label: "手机" },
    { key: "youxiang", label: "邮箱" },
    { key: "touxiang", label: "头像", type: "image" },
    { key: "money", label: "余额", type: "number" }
  ],
  product: [
    { key: "shangpinmingcheng", label: "商品名称" },
    { key: "shangpinleixing", label: "商品类型" },
    { key: "guige", label: "规格" },
    { key: "shangjiashijian", label: "上架时间", type: "date" },
    { key: "shangpintupian", label: "商品图片", type: "image" },
    { key: "price", label: "价格", type: "number" },
    { key: "onelimittimes", label: "单限", type: "number" },
    { key: "alllimittimes", label: "库存", type: "number" },
    { key: "shangpinjieshao", label: "商品介绍", type: "textarea" }
  ],
  category: [{ key: "leixing", label: "类型" }],
  news: [
    { key: "title", label: "标题" },
    { key: "picture", label: "图片", type: "image" },
    { key: "introduction", label: "简介", type: "textarea" },
    { key: "content", label: "内容", type: "textarea" }
  ],
  carousel: [
    { key: "name", label: "配置名称" },
    { key: "value", label: "图片/配置值", type: "image" }
  ],
  orders: [
    { key: "orderid", label: "订单号" },
    { key: "goodname", label: "商品名称" },
    { key: "picture", label: "商品图片", type: "image" },
    { key: "buynumber", label: "数量", type: "number" },
    { key: "price", label: "单价", type: "number" },
    { key: "total", label: "总价", type: "number" },
    { key: "status", label: "订单状态" },
    { key: "address", label: "地址" },
    { key: "tel", label: "电话" },
    { key: "consignee", label: "收货人" },
    { key: "logistics", label: "物流" }
  ]
};

const profileFields = [
  { key: "username", label: "管理员账号" },
  { key: "password", label: "密码", type: "password" },
  { key: "role", label: "身份" }
];

const router = useRouter();
const adminToken = ref(localStorage.getItem(ADMIN_TOKEN_KEY) || "");
const activeModule = ref("home");
const rows = ref([]);
const comments = ref([]);
const loading = ref(false);
const message = ref("");
const isError = ref(false);
const uploadInputRef = ref(null);
const uploadTargetKey = ref("");
const adminProfile = reactive({});
const stats = reactive({ users: 0, product: 0, category: 0, news: 0, orders: 0 });
const pager = reactive({ page: 1, limit: 10, totalPage: 1 });
const dialog = reactive({ open: false, mode: "create", model: {} });

const isAuthed = computed(() => Boolean(adminToken.value));
const currentModule = computed(() => modules.find((item) => item.key === activeModule.value) || modules[0]);
const currentEndpoint = computed(() => currentModule.value.endpoint || "");
const currentCols = computed(() => columnsMap[activeModule.value] || []);
const currentFormFields = computed(() => formFieldsMap[activeModule.value] || []);
const detailFields = computed(() => currentFormFields.value.length ? currentFormFields.value : currentCols.value.filter((col) => col.type !== "index"));
const dialogTitle = computed(() => {
  if (dialog.mode === "detail") return "详情";
  if (dialog.mode === "comments") return "商品评论";
  return dialog.mode === "create" ? "新增" : "修改";
});
const dashboardCards = computed(() => [
  { label: "用户数量", value: stats.users, icon: "👥" },
  { label: "商品数量", value: stats.product, icon: "🛍️" },
  { label: "分类数量", value: stats.category, icon: "🏷️" },
  { label: "资讯数量", value: stats.news, icon: "📰" },
  { label: "订单数量", value: stats.orders, icon: "📦" }
]);

const adminHttp = axios.create({ baseURL: API_BASE, timeout: 15000 });
adminHttp.interceptors.request.use((config) => {
  if (adminToken.value) config.headers.Token = adminToken.value;
  return config;
});
adminHttp.interceptors.response.use(
  (resp) => {
    if (typeof resp.data?.code !== "undefined" && resp.data.code !== 0) {
      showNotice(resp.data.msg || "操作失败");
      return Promise.reject(new Error(resp.data.msg || "操作失败"));
    }
    return resp.data;
  },
  (error) => {
    const message = error?.response?.data?.msg || error.message || "网络异常";
    showNotice(message);
    return Promise.reject(new Error(message));
  }
);

function setMessage(text, error = false) {
  message.value = text;
  isError.value = error;
}

function showVal(value) {
  if (value === null || typeof value === "undefined" || value === "") return "-";
  return String(value);
}

function showImage(value) {
  if (!value) return "";
  return toImageUrl(value);
}

function goLogin() {
  router.push({ name: "login", query: { type: "admin" } });
}

function logoutAdmin() {
  adminToken.value = "";
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  router.push({ name: "login", query: { type: "admin" } });
}

function switchModule(key) {
  activeModule.value = key;
  closeDialog();
  setMessage("");
  if (key === "home") loadStats();
  else if (key === "profile") loadAdminProfile();
  else fetchRows(1);
}

async function loadStats() {
  const pairs = [
    ["users", "/yonghu/page"],
    ["product", "/shangpinxinxi/page"],
    ["category", "/shangpinfenlei/page"],
    ["news", "/news/page"],
    ["orders", "/orders/page"]
  ];
  try {
    const result = await Promise.all(pairs.map(([, url]) => adminHttp.get(url, { params: { page: 1, limit: 1 } })));
    pairs.forEach(([key], index) => {
      stats[key] = Number(result[index].data?.total || 0);
    });
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function loadAdminProfile() {
  try {
    const res = await adminHttp.get("/users/session");
    Object.assign(adminProfile, res.data || {});
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function saveAdminProfile() {
  try {
    await adminHttp.post("/users/update", adminProfile);
    setMessage("管理员资料保存成功");
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function fetchRows(page = pager.page) {
  if (!currentEndpoint.value) return;
  loading.value = true;
  try {
    const res = await adminHttp.get(`${currentEndpoint.value}/page`, {
      params: { page, limit: pager.limit, sort: "id", order: "desc" }
    });
    rows.value = res.data?.list || [];
    pager.page = Number(res.data?.currPage || page);
    pager.totalPage = Number(res.data?.totalPage || 1);
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    loading.value = false;
  }
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

function openDetail(row) {
  dialog.mode = "detail";
  dialog.model = { ...row };
  dialog.open = true;
}

async function openComments(row) {
  dialog.mode = "comments";
  dialog.model = { ...row };
  dialog.open = true;
  try {
    const res = await adminHttp.get("/discussshangpinxinxi/page", {
      params: { page: 1, limit: 50, refid: row.id, sort: "id", order: "desc" }
    });
    comments.value = res.data?.list || [];
  } catch (error) {
    setMessage(error.message, true);
  }
}

function closeDialog() {
  dialog.open = false;
  dialog.model = {};
  comments.value = [];
  uploadTargetKey.value = "";
}

function triggerImageUpload(key) {
  uploadTargetKey.value = key;
  uploadInputRef.value?.click();
}

async function onFilePicked(event) {
  const file = event.target?.files?.[0];
  if (!file || !uploadTargetKey.value) return;
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await adminHttp.post("/file/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
    dialog.model[uploadTargetKey.value] = res.file;
    setMessage("图片上传成功");
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    event.target.value = "";
  }
}

async function submitDialog() {
  try {
    const endpoint = dialog.mode === "create" ? "/save" : "/update";
    await adminHttp.post(`${currentEndpoint.value}${endpoint}`, dialog.model);
    closeDialog();
    await fetchRows(pager.page);
    setMessage("保存成功");
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function saveCommentReply(comment) {
  try {
    await adminHttp.post("/discussshangpinxinxi/update", comment);
    setMessage("评论回复保存成功");
  } catch (error) {
    setMessage(error.message, true);
  }
}

async function removeRow(id) {
  if (!id || !window.confirm("确认删除这条数据吗？")) return;
  try {
    await adminHttp.post(`${currentEndpoint.value}/delete`, [id]);
    await fetchRows(1);
    setMessage("删除成功");
  } catch (error) {
    setMessage(error.message, true);
  }
}

onMounted(() => {
  if (isAuthed.value) loadStats();
});
</script>
