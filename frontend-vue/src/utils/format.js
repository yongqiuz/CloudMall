import { fileBase } from "../api/http";

export function toImageUrl(rawPath) {
  if (!rawPath) return "";
  if (/^https?:\/\//.test(rawPath)) return rawPath;
  return `${fileBase}/${String(rawPath).replace(/^\/+/, "")}`;
}

export function money(value) {
  const num = Number(value || 0);
  return `¥${num.toFixed(2)}`;
}

export function nowTime() {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function toDateText(value) {
  if (!value) return "";
  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : text;
}
