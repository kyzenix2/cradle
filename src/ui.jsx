import { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { CRADLE_CA, X_HANDLE, X_URL, short, sigilBits } from "./format";

const ToastCtx = createContext(() => {});
export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3200);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <ToastCtx.Provider value={setMsg}>
      {children}
      {msg && (
        <div className="toast" role="status">
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function Mark({ size = 18 }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="currentColor" />
      <path fill="var(--bg)" d="M6 7h4v8H6zM22 7h4v8h-4zM6 15h20v4H6zM10 19h12v4H10z" />
    </svg>
  );
}

export function Sigil({ address, image, size = 24 }) {
  const bits = sigilBits(address || "cradle");
  return (
    <span className="sigil" style={{ width: size, height: size }}>
      {image ? (
        <img src={image} alt="" />
      ) : (
        <span
          aria-hidden="true"
          style={{
            width: "70%",
            height: "70%",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 1,
          }}
        >
          {bits.map((on, i) => (
            <i key={i} style={{ background: on ? "var(--fg)" : "transparent", display: "block" }} />
          ))}
        </span>
      )}
    </span>
  );
}

export function Pill({ state, graduated }) {
  if (graduated) return <span className="pill grad">graduated</span>;
  const awake = state === "awake" || state === "running";
  return (
    <span className={`pill ${state || "asleep"}`}>
      <i />
      {state || "asleep"}
    </span>
  );
}

export function CopyAddress({ label, address, href, compact }) {
  const [copied, setCopied] = useState(false);
  const text = compact ? short(address) : address;
  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const el = document.createElement("textarea");
      el.value = address;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <span className="ca">
      <b>{label}</b>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" title={address}>
          {text}
        </a>
      ) : (
        <button type="button" className="ca-addr" onClick={copy} title="Click to copy">
          {text}
        </button>
      )}
      <button type="button" onClick={copy} aria-label={`Copy ${label} contract address`}>
        {copied ? "copied" : "copy"}
      </button>
    </span>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M9.3 7.1 14.2 1.5h-1.2L8.8 6.3 5.2 1.5H1.6l5.2 7.5-5.2 6h1.2l4.5-5.2 3.8 5.2h3.6L9.3 7.1Zm-1.6 1.8-.5-.7L3.2 2.4h1.7l3.3 4.7.5.7 4.3 6.1H11.3L7.7 8.9Z" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.7" d="M16 3.2A8.5 8.5 0 1 0 20.8 14 7 7 0 0 1 16 3.2Z" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path stroke="currentColor" strokeWidth="1.7" d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19" />
    </svg>
  );
}

export function Shell({ children }) {
  const toast = useToast();
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === "dark");
  function toggleTheme() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("cradle-theme", next);
    setDark(!dark);
  }
  return (
    <>
      <header className="top">
        <div className="wrap">
          <Link to="/" className="brand" aria-label="Cradle home">
            <Mark />
            <b>cradle</b>
          </Link>
          <nav className="main">
            {[
              ["/", "Explore"],
              ["/launch", "Launch"],
              ["/stake", "Stake"],
              ["/models", "Models"],
              ["/docs", "Docs"],
            ].map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : undefined)}>
                {label}
              </NavLink>
            ))}
          </nav>
          <button className="btn buy-cradle" type="button" onClick={() => toast("Contract address is TBA.")}>
            Buy <span className="buy-ticker">$CRADLE</span>
          </button>
          <a className="xlink" href={X_URL} target="_blank" rel="noreferrer" aria-label="Cradle on X">
            <IconX />
          </a>
          <button className="theme-btn xlink" type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? <IconSun /> : <IconMoon />}
          </button>
          <button className="btn" type="button" onClick={() => toast("No wallet found. This preview does not connect a wallet.")}>
            Connect
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="foot">
        <div className="wrap">
          <span>Cradle · where agents are born · Robinhood Chain</span>
          <span className="foot-links">
            <CopyAddress label="$CRADLE" address={CRADLE_CA} compact />
            <a href={X_URL} target="_blank" rel="noreferrer">
              {X_HANDLE}
            </a>
          </span>
          <span style={{ flexBasis: "100%" }}>Inference by Orbio · Liquidity on Uniswap v4 · Not financial advice</span>
        </div>
      </footer>
    </>
  );
}

export function Chart({ points, ethUsd }) {
  if (!points || points.length < 2) return <div className="empty">The chart starts with the first trade.</div>;
  const n = 800;
  const r = 240;
  const s = { l: 8, r: 70, t: 14, b: 22 };
  const a = points[points.length - 1].ts - points[0].ts < 10 * 6e4;
  const i = points.map((v, k) => (a ? k : v.ts));
  const o = points.map((v) => v.price_eth * ethUsd * 1e9);
  const l = Math.min(...i);
  const c = Math.max(...i);
  let d = Math.min(...o);
  let f = Math.max(...o);
  if (f - d < f * 0.02) {
    d *= 0.98;
    f *= 1.02;
  }
  const p = (v) => s.l + ((v - l) / Math.max(a ? 1 : 1e3, c - l)) * (n - s.l - s.r);
  const h = (v) => s.t + (1 - (v - d) / (f - d)) * (r - s.t - s.b);
  const w = points.map((_, k) => `${k ? "L" : "M"}${p(i[k]).toFixed(1)},${h(o[k]).toFixed(1)}`).join("");
  const b = `${w}L${p(c)},${r - s.b}L${p(l)},${r - s.b}Z`;
  const x = [d, (d + f) / 2, f];
  const m = points.length - 1;
  const y = o[m] >= o[0] ? "var(--live)" : "var(--down)";
  return (
    <>
      <svg viewBox={`0 0 ${n} ${r}`} preserveAspectRatio="none" role="img" aria-label="Market cap over time">
        <defs>
          <linearGradient id="fillg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={y} stopOpacity="0.08" />
            <stop offset="1" stopColor={y} stopOpacity="0" />
          </linearGradient>
        </defs>
        {x.map((v, k) => (
          <line key={k} x1={s.l} x2={n - s.r} y1={h(v)} y2={h(v)} stroke="var(--line)" strokeDasharray="3 4" />
        ))}
        <path d={b} fill="url(#fillg)" />
        <path d={w} fill="none" stroke={y} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx={p(i[m])} cy={h(o[m])} r="3" fill={y} />
      </svg>
      {x.map((v, k) => (
        <span key={k} className="yl" style={{ top: 8 + h(v) * (220 / r) }}>
          {fmtAxis(v)}
        </span>
      ))}
    </>
  );
}

function fmtAxis(v) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}
