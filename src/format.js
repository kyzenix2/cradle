export const CRADLE_CA = "TBA";
export const EXPLORER = "https://robinhoodchain.blockscout.com";
export const X_URL = "https://x.com/cradleSOL";
export const X_HANDLE = "@cradleSOL";
export const VTOK = 1_073_000_000;
export const SUPPLY = 1_000_000_000;
export const FEE = 0.015;

export function money(e) {
  if (e == null || Number.isNaN(Number(e))) return "–";
  const n = Number(e);
  const a = Math.abs(n);
  if (a >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (a >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(n === 0 ? 0 : 3)}`;
}

export function compact(e) {
  const n = Number(e) || 0;
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  if (a >= 1) return n.toFixed(2);
  return n.toFixed(0);
}

export function priceUsd(e) {
  const n = Number(e) || 0;
  if (n === 0) return "$0";
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  const t = Math.floor(-Math.log10(n));
  const sub = String(t - 1)
    .split("")
    .map((d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)])
    .join("");
  return `$0.0${sub}${(n * 10 ** (t + 3)).toFixed(0)}`;
}

export function short(a, head = 6, tail = 4) {
  if (!a) return "";
  if (a.length <= head + tail + 1) return a;
  return `${a.slice(0, head)}…${a.slice(-tail)}`;
}

export function ago(ts) {
  if (!ts) return "–";
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function clock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function quoteBuy(realEth, ethIn) {
  const net = ethIn * (1 - FEE);
  const fee = ethIn * FEE;
  const reserve = VTOK / (1 + realEth);
  const next = VTOK / (1 + realEth + net);
  return { out: Math.max(0, reserve - next), fee, each: fee / 3 };
}

export function quoteSell(realEth, tokens) {
  const reserve = VTOK / (1 + realEth);
  const nextReserve = reserve + tokens;
  if (tokens <= 0 || nextReserve >= VTOK) return { out: 0, fee: 0, each: 0 };
  const gross = (1 + realEth) - VTOK / nextReserve;
  const fee = Math.max(0, gross) * FEE;
  return { out: Math.max(0, gross - fee), fee, each: fee / 3 };
}

export function startingMcap(ethUsd) {
  return (1 / VTOK) * SUPPLY * ethUsd;
}

export function sigilBits(address) {
  let t = 2166136261;
  for (const s of String(address || "0x").toLowerCase()) t = Math.imul(t ^ s.charCodeAt(0), 16777619);
  const n = [];
  for (let s = 0; s < 15; s++) {
    t ^= t << 13;
    t ^= t >>> 17;
    t ^= t << 5;
    n.push(((t >>> 0) & 3) !== 0);
  }
  const r = [];
  for (let s = 0; s < 5; s++) {
    for (let a = 0; a < 5; a++) r.push(n[s * 3 + (a < 3 ? a : 4 - a)]);
  }
  return r;
}
