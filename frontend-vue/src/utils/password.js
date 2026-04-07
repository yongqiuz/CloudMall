const MIN_PASSWORD_LEN = 6;
const MAX_PASSWORD_LEN = 12;

export function validatePassword(password) {
  const value = String(password || "");
  if (value.length < MIN_PASSWORD_LEN || value.length > MAX_PASSWORD_LEN) {
    return "\u5bc6\u7801\u957f\u5ea6\u9700\u8981\u5728 6 \u5230 12 \u4f4d";
  }
  if (!/[A-Z]/.test(value)) {
    return "\u5bc6\u7801\u9700\u8981\u81f3\u5c11\u4e00\u4f4d\u5927\u5199\u5b57\u6bcd";
  }
  if (!/[a-z]/.test(value)) {
    return "\u5bc6\u7801\u9700\u8981\u81f3\u5c11\u4e00\u4f4d\u5c0f\u5199\u5b57\u6bcd";
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return "\u5bc6\u7801\u9700\u8981\u81f3\u5c11\u4e00\u4f4d\u7279\u6b8a\u7b26\u53f7";
  }
  return "";
}

export function passwordStrength(password) {
  const value = String(password || "");
  const checks = [
    value.length >= MIN_PASSWORD_LEN && value.length <= MAX_PASSWORD_LEN,
    /[A-Z]/.test(value),
    /[a-z]/.test(value),
    /[^A-Za-z0-9]/.test(value)
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["\u5f88\u5f31", "\u4e00\u822c", "\u8f83\u5f3a", "\u5f88\u5f3a"];
  return {
    score,
    label: labels[Math.min(score, labels.length - 1)],
    items: checks
  };
}
