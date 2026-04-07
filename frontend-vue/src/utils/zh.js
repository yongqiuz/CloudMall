const categoryMap = {
  beauty: "\u7f8e\u5986\u62a4\u80a4",
  fragrances: "\u9999\u6c34\u9999\u6c1b",
  furniture: "\u5bb6\u5177\u5bb6\u5c45",
  groceries: "\u98df\u54c1\u751f\u9c9c",
  "home-decoration": "\u5c45\u5bb6\u88c5\u9970",
  "kitchen-accessories": "\u53a8\u623f\u7528\u54c1",
  laptops: "\u7b14\u8bb0\u672c\u7535\u8111",
  "mens-shirts": "\u7537\u88c5\u4e0a\u8863",
  "mens-shoes": "\u7537\u978b",
  "mens-watches": "\u7537\u58eb\u624b\u8868",
  "mobile-accessories": "\u624b\u673a\u914d\u4ef6",
  motorcycle: "\u6469\u6258\u51fa\u884c",
  "skin-care": "\u62a4\u80a4\u4fdd\u517b",
  smartphones: "\u667a\u80fd\u624b\u673a",
  "sports-accessories": "\u8fd0\u52a8\u6237\u5916",
  sunglasses: "\u592a\u9633\u773c\u955c",
  tablets: "\u5e73\u677f\u7535\u8111",
  tops: "\u65f6\u5c1a\u4e0a\u88c5",
  vehicle: "\u6c7d\u8f66\u7528\u54c1",
  "womens-bags": "\u5973\u5305",
  "womens-dresses": "\u8fde\u8863\u88d9",
  "womens-jewellery": "\u9970\u54c1\u73e0\u5b9d",
  "womens-shoes": "\u5973\u978b",
  "womens-watches": "\u5973\u58eb\u624b\u8868"
};

export function zhCategory(name) {
  if (!name) return "\u672a\u5206\u7c7b";
  if (isBrokenText(name)) return "\u672a\u5206\u7c7b";
  return categoryMap[name] || name;
}

export function isBrokenText(text) {
  if (!text) return true;
  const s = String(text);
  const qCount = (s.match(/\?/g) || []).length;
  if (qCount >= Math.max(2, Math.floor(s.length * 0.3))) return true;
  const mojibakeHits = (s.match(/[鍟鐨鏄涓闈璇鏌閫鍏绯鎴鍒浠鍚]/g) || []).length;
  return mojibakeHits >= 2;
}

export function zhProductName(p) {
  const id = p?.id || "";
  const raw = p?.shangpinmingcheng || p?.goodname || "";
  if (!raw || isBrokenText(raw) || /^[A-Za-z0-9\s\-_'.,]+$/.test(raw)) {
    return `${zhCategory(p?.shangpinleixing)}\u7cbe\u9009\u5546\u54c1${id}`;
  }
  return raw;
}

export function zhSpec(item) {
  const raw = item?.guige || "";
  if (!raw || isBrokenText(raw)) {
    return `\u5b98\u65b9\u6807\u914d | \u5e93\u5b58${item?.alllimittimes ?? 0}`;
  }
  return raw;
}

export function zhNewsTitle(item) {
  const raw = item?.title || "";
  if (isBrokenText(raw)) return `\u5546\u57ce\u5feb\u62a5\u7b2c${item?.id || ""}\u671f`;
  return raw;
}

export function zhNewsIntro(item) {
  const raw = item?.introduction || "";
  if (isBrokenText(raw)) return "\u5e73\u53f0\u7cbe\u9009\u8fd0\u8425\u8d44\u8baf\uff0c\u5df2\u5b8c\u6210\u4e2d\u6587\u5316\u5c55\u793a\u3002";
  return raw;
}

export function zhCommentContent(item) {
  const raw = item?.content || "";
  if (isBrokenText(raw)) return `\u5546\u54c1\u4f53\u9a8c\u4e0d\u9519\uff0c\u6027\u4ef7\u6bd4\u9ad8\uff08\u8bc4\u8bba#${item?.id || ""}\uff09\u3002`;
  return raw;
}

export function zhNickname(item) {
  const raw = item?.nickname || "";
  if (isBrokenText(raw)) return `\u7528\u6237${item?.userid || item?.id || ""}`;
  return raw;
}
