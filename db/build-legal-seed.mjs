#!/usr/bin/env node
/**
 * Build legal, third-party-backed SQL seed data for this mall project.
 *
 * Data sources:
 * - https://dummyjson.com/products
 * - https://dummyjson.com/users
 * - https://dummyjson.com/comments
 *
 * Usage:
 *   node db/build-legal-seed.mjs
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const OUTPUT_SQL = resolve(process.cwd(), "db", "legal-thirdparty-seed.sql");
const PRODUCT_LIMIT = 194;
const USER_LIMIT = 120;
const COMMENT_LIMIT = 600;

function sqlEscape(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  const str = String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\u0000/g, "");
  return `'${str}'`;
}

function toFloat(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Number(n.toFixed(2)));
}

function pickRandom(arr, index) {
  if (!arr.length) return null;
  return arr[index % arr.length];
}

function toGender(gender) {
  if (!gender) return "Unknown";
  const g = String(gender).toLowerCase();
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  return "Unknown";
}

function stripHtmlUnsafe(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "webmarket-legal-seed-script/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Request failed ${res.status} for ${url}`);
  }
  return res.json();
}

function buildCategorySql(products) {
  const names = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const lines = [];
  lines.push("-- Categories");
  lines.push("DELETE FROM `shangpinfenlei`;");
  names.forEach((name, idx) => {
    lines.push(
      `INSERT INTO \`shangpinfenlei\` (\`id\`, \`addtime\`, \`leixing\`) VALUES (${idx + 1}, NOW(), ${sqlEscape(
        name
      )});`
    );
  });
  return { sql: lines.join("\n"), categories: names };
}

function buildProductSql(products) {
  const lines = [];
  lines.push("-- Products");
  lines.push("DELETE FROM `shangpinxinxi`;");
  products.forEach((p, idx) => {
    const id = idx + 1;
    const name = p.title || `商品${id}`;
    const category = p.category || "未分类";
    const guige = `${p.brand || "Generic"} | stock ${p.stock ?? 99}`;
    const desc = stripHtmlUnsafe(p.description);
    const img = p.thumbnail || (Array.isArray(p.images) ? p.images[0] : "") || "";
    const price = toFloat(p.price, 9.9);
    const stock = Math.max(1, Number(p.stock || 100));
    const clicks = Math.max(1, Math.round(Number((p.rating || 3) * 123)));
    const likes = Math.max(0, Math.round(Number((p.rating || 3) * 50)));
    const dislikes = Math.max(0, Math.round((5 - (p.rating || 3)) * 12));
    lines.push(
      "INSERT INTO `shangpinxinxi` " +
        "(`id`,`addtime`,`shangpinmingcheng`,`shangpinleixing`,`guige`,`shangjiashijian`,`shangpinjieshao`,`shangpintupian`,`thumbsupnum`,`crazilynum`,`clicktime`,`clicknum`,`price`,`onelimittimes`,`alllimittimes`) VALUES " +
        `(${id},NOW(),${sqlEscape(name)},${sqlEscape(category)},${sqlEscape(guige)},CURDATE(),${sqlEscape(
          desc
        )},${sqlEscape(img)},${likes},${dislikes},NOW(),${clicks},${price},5,${stock});`
    );
  });
  return lines.join("\n");
}

function buildUserSql(users) {
  const lines = [];
  lines.push("-- Users");
  lines.push("DELETE FROM `yonghu`;");
  users.forEach((u, idx) => {
    const id = idx + 1;
    const account = u.username || `user_${id}`;
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || account;
    const phone = u.phone || `1380000${String(id).padStart(4, "0")}`;
    const email = u.email || `${account}@demo.com`;
    const avatar = u.image || "";
    const gender = toGender(u.gender);
    const money = toFloat(200 + (idx % 40) * 33.5, 200);
    lines.push(
      "INSERT INTO `yonghu` " +
        "(`id`,`addtime`,`zhanghao`,`mima`,`xingming`,`xingbie`,`shouji`,`youxiang`,`touxiang`,`money`) VALUES " +
        `(${id},NOW(),${sqlEscape(account)},${sqlEscape("123456")},${sqlEscape(name)},${sqlEscape(
          gender
        )},${sqlEscape(phone)},${sqlEscape(email)},${sqlEscape(avatar)},${money});`
    );
  });
  return lines.join("\n");
}

function buildCommentSql(comments, productCount, userCount) {
  const lines = [];
  lines.push("-- Product comments");
  lines.push("DELETE FROM `discussshangpinxinxi`;");
  comments.forEach((c, idx) => {
    const id = idx + 1;
    const refid = (idx % productCount) + 1;
    const userid = (idx % userCount) + 1;
    const nickname = c?.user?.username || c?.user?.fullName || `buyer_${userid}`;
    const content = stripHtmlUnsafe(c.body || "Great quality, fast delivery, recommended.");
    const reply = idx % 4 === 0 ? "Thanks for your support." : "";
    lines.push(
      "INSERT INTO `discussshangpinxinxi` " +
        "(`id`,`addtime`,`refid`,`userid`,`nickname`,`content`,`reply`) VALUES " +
        `(${id},NOW(),${refid},${userid},${sqlEscape(nickname)},${sqlEscape(content)},${sqlEscape(reply)});`
    );
  });
  return lines.join("\n");
}

function buildNewsSql(products) {
  const lines = [];
  lines.push("-- News");
  lines.push("DELETE FROM `news`;");
  const picked = products.slice(0, 30);
  picked.forEach((p, idx) => {
    const id = idx + 1;
    const title = `${p.title || "Product"} New Arrival`;
    const intro = `${p.description || "Featured product"} (Source: DummyJSON sample data)`;
    const img = p.thumbnail || "";
    const content = `<p>${stripHtmlUnsafe(p.description || "New product is now available.")}</p><p>Category: ${stripHtmlUnsafe(
      p.category || "Uncategorized"
    )}, Brand: ${stripHtmlUnsafe(p.brand || "Generic")}.</p>`;
    lines.push(
      "INSERT INTO `news` (`id`,`addtime`,`title`,`introduction`,`picture`,`content`) VALUES " +
        `(${id},NOW(),${sqlEscape(title)},${sqlEscape(intro)},${sqlEscape(img)},${sqlEscape(content)});`
    );
  });
  return lines.join("\n");
}

async function main() {
  const [productsRes, usersRes, commentsRes] = await Promise.all([
    fetchJson(`https://dummyjson.com/products?limit=${PRODUCT_LIMIT}&skip=0`),
    fetchJson(`https://dummyjson.com/users?limit=${USER_LIMIT}&skip=0`),
    fetchJson(`https://dummyjson.com/comments?limit=${COMMENT_LIMIT}&skip=0`),
  ]);

  const products = Array.isArray(productsRes.products) ? productsRes.products : [];
  const users = Array.isArray(usersRes.users) ? usersRes.users : [];
  const comments = Array.isArray(commentsRes.comments) ? commentsRes.comments : [];

  if (!products.length || !users.length || !comments.length) {
    throw new Error("Third-party data is empty, generation aborted.");
  }

  const categoryResult = buildCategorySql(products);
  const productSql = buildProductSql(products);
  const userSql = buildUserSql(users);
  const commentSql = buildCommentSql(comments, products.length, users.length);
  const newsSql = buildNewsSql(products);

  const sql = [
    "-- legal-thirdparty-seed.sql",
    "-- Generated from open sample APIs (DummyJSON).",
    "-- This avoids copying copyrighted marketplace data.",
    "SET NAMES utf8mb4;",
    "SET FOREIGN_KEY_CHECKS = 0;",
    "",
    categoryResult.sql,
    "",
    productSql,
    "",
    userSql,
    "",
    commentSql,
    "",
    newsSql,
    "",
    "SET FOREIGN_KEY_CHECKS = 1;",
    "",
  ].join("\n");

  await writeFile(OUTPUT_SQL, sql, "utf8");
  console.log(`Done. SQL written to: ${OUTPUT_SQL}`);
  console.log(
    `Inserted preview: categories=${categoryResult.categories.length}, products=${products.length}, users=${users.length}, comments=${comments.length}, news=${Math.min(
      30,
      products.length
    )}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
