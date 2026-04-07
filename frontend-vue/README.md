# CloudMall 前端（Vue3）

## 技术栈
- Vue 3 + Pinia + Vue Router + Axios
- Vite 开发服务（默认 5173）
- 对接后端统一上下文：`/springcloudk02l8`

## 页面能力
- 首页（热门分类、热销商品、商城资讯）
- 商品列表（关键字 + 分类 + 排序 + 分页）
- 商品详情（加入购物车、立即购买、评论展示与发布）
- 购物车（改数量、删除、一键下单）
- 订单中心（状态、金额、物流）
- 用户登录/注册/个人资料
- 商城资讯（列表 + 详情）

## 启动方式
在 `C:\Users\90538\Desktop\webmarket\frontend-vue` 目录执行：

```bash
npm install
npm run dev
```

## Mock 商城数据（后端）
已提供脚本：`C:\Users\90538\Desktop\webmarket\db\mock-mall-seed.sql`

导入方式：

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 springcloudk02l8 < C:\Users\90538\Desktop\webmarket\db\mock-mall-seed.sql
```

脚本会写入更完整的分类、商品、用户、评论、资讯演示数据，用于快速呈现成熟商城观感。
