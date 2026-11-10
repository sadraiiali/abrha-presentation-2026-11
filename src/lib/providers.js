const logos = {
  anthropic: "anthropic",
  deepseek: "deepseek",
  google: "google",
  meta: "meta",
  "meta-llama": "meta",
  mistralai: "mistralai",
  nvidia: "nvidia",
  openai: "openai",
  perplexity: "perplexity",
  qwen: "alibabacloud",
  tencent: "tencentqq",
  "x-ai": "x",
  xiaomi: "xiaomi",
};

export function providerOf(slug) {
  return slug.split("/")[0];
}

export function logoSlug(provider) {
  return logos[provider] ?? null;
}

const ktFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function kt(n) {
  return `${ktFormat.format(Number(n) / 1000)} KT`;
}

export function tokens(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US");
}
