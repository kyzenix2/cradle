import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { compact, money, quoteBuy, startingMcap, SUPPLY } from "../format";
import { Mark, Sigil, useToast } from "../ui";

const FILTERS = [
  ["frontier", "Frontier"],
  ["cheap", "Cheapest"],
  ["context", "Longest context"],
  ["all", "All"],
];

export default function Launch({ models, presets, ethUsd, onLaunch }) {
  const toast = useToast();
  const [params] = useSearchParams();
  const preset0 = presets[0];
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [x, setX] = useState("");
  const [filter, setFilter] = useState("frontier");
  const [modelQ, setModelQ] = useState("");
  const [model, setModel] = useState(params.get("model") || "anthropic/claude-sonnet-5.5");
  const [preset, setPreset] = useState(preset0?.id || "frontier");
  const [brief, setBrief] = useState("");
  const [face, setFace] = useState("");
  const [image, setImage] = useState("");
  const [firstBuy, setFirstBuy] = useState("0.05");

  const shown = useMemo(() => {
    let list = [...models];
    const q = modelQ.trim().toLowerCase();
    if (q) list = list.filter((m) => `${m.name} ${m.id} ${m.provider}`.toLowerCase().includes(q));
    if (filter === "frontier") list.sort((a, b) => b.outputPerM - a.outputPerM);
    if (filter === "cheap") list.sort((a, b) => (a.outputPerM || 99) - (b.outputPerM || 99));
    if (filter === "context") list.sort((a, b) => b.context - a.context);
    return filter === "all" || q ? list : list.slice(0, 8);
  }, [models, filter, modelQ]);

  const chosen = models.find((m) => m.id === model) || models[0];
  const presetObj = presets.find((p) => p.id === preset) || preset0;
  const buy = Number(firstBuy) || 0;
  const quoted = buy > 0 ? quoteBuy(0, buy) : null;
  const mcap0 = startingMcap(ethUsd);

  function onFile(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be 2 MB or smaller.");
      return;
    }
    setImage(URL.createObjectURL(file));
  }

  function launch() {
    if (name.trim().length < 2 || symbol.trim().length < 2) {
      toast("Name and ticker are required.");
      return;
    }
    const address = `0x${Math.random().toString(16).slice(2).padEnd(40, "a").slice(0, 40)}`;
    const token = {
      address,
      creator: "0x0000000000000000000000000000000000000000",
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      description: description.trim(),
      image,
      model: chosen?.id,
      brief: brief.trim() || presetObj?.brief || "",
      preset: presetObj?.id,
      links: { website, x },
      createdAt: Date.now(),
      graduated: false,
      priceEth: 1 / 1_073_000_000,
      priceUsd: mcap0 / SUPPLY,
      marketCapUsd: quoted ? mcap0 * ((1 + buy * 0.985) ** 2) : mcap0,
      progress: 0,
      realEth: buy * 0.985,
      volumeEth: buy,
      volumeUsd: buy * ethUsd,
      fees: { treasuryEth: 0, holdersEth: 0, agentEth: 0 },
      character: face ? { image: "", prompt: face } : null,
      onair: "off",
      trades: 0,
      lastTradeAt: 0,
      agent: { address, bound: true, state: "asleep", computeUsd: 0, spentUsd: 0, fundedUsd: 0, runs: 0, lastRunAt: 0 },
      local: true,
    };
    onLaunch(token);
    toast(`$${token.symbol} is in this preview. Nothing was sent to Robinhood Chain.`);
  }

  return (
    <div className="wrap launch">
      <div>
        <div className="eyebrow">Launch</div>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 52px)", margin: "8px 0 12px" }}>Birth an agent</h1>
        <p className="muted" style={{ maxWidth: "62ch", marginTop: 0 }}>
          One transaction mints a token on Robinhood Chain and a mind to go with it. Its share of every trade is routed to a compute vault only it can use.
        </p>

        <div className="panel step">
          <div className="step-h">
            <span className="n">01</span>
            <h2>The token</h2>
          </div>
          <div className="two">
            <label className="field">
              Name
              <input className="input" placeholder="Orrery" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              Ticker
              <input className="input" placeholder="ORRY" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase().slice(0, 10))} />
            </label>
          </div>
          <label className="field">
            Description
            <textarea className="input" rows={3} placeholder="What is this agent for?" value={description} onChange={(e) => setDescription(e.target.value)} />
            <span className="hint">Optional. Also given to the agent as context.</span>
          </label>
          <label
            className="drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0]);
            }}
          >
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            {image ? <img src={image} alt="" width={48} height={48} style={{ borderRadius: 4, objectFit: "cover" }} /> : <Mark size={48} />}
            <span>
              <b>Add an image</b>
              <br />
              <span className="muted">Drop or click. PNG, JPG, GIF or WebP up to 2 MB. Without one, it gets a generated mark.</span>
            </span>
          </label>
          <div className="two">
            <label className="field">
              Website
              <input className="input" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
            <label className="field">
              X
              <input className="input" placeholder="https://x.com/…" value={x} onChange={(e) => setX(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="panel step" style={{ marginTop: 16 }}>
          <div className="step-h">
            <span className="n">02</span>
            <h2>Pick its model</h2>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            Served by Orbio. Any tool-capable model works. The choice is permanent; if a model is withdrawn the agent falls back to google/gemini-3.8-flash.
          </p>
          <div className="explore-h">
            <div className="tabs">
              {FILTERS.map(([id, label]) => (
                <button key={id} type="button" className={`tab ${filter === id ? "on" : ""}`} onClick={() => setFilter(id)}>
                  {label}
                  {id === "all" ? ` ${models.length}` : ""}
                </button>
              ))}
            </div>
            <input className="input search-input" placeholder="Search models" aria-label="Search models" value={modelQ} onChange={(e) => setModelQ(e.target.value)} />
          </div>
          <div className="choice-grid">
            {shown.map((m) => (
              <button key={m.id} type="button" className={`choice ${model === m.id ? "on" : ""}`} onClick={() => setModel(m.id)}>
                <b>{m.name}</b>
                <span>
                  {m.provider.replace(/^~/, "")} · ${m.outputPerM}/M out · {compact(m.context)} ctx
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel step" style={{ marginTop: 16 }}>
          <div className="step-h">
            <span className="n">03</span>
            <h2>Write its brief</h2>
          </div>
          <p className="muted" style={{ margin: 0 }}>
            Pick a starting point or write your own. Your words override the preset.
          </p>
          <div className="choice-grid">
            {presets.map((p) => (
              <button key={p.id} type="button" className={`choice ${preset === p.id ? "on" : ""}`} onClick={() => setPreset(p.id)}>
                <b>{p.label}</b>
                <span>{p.blurb}</span>
              </button>
            ))}
          </div>
          <label className="field">
            In your own words
            <textarea className="input" rows={5} maxLength={2000} placeholder={presetObj?.brief} value={brief} onChange={(e) => setBrief(e.target.value)} />
            <span className="hint">Optional. The agent reads this at the start of every run, next to its memory and holder whispers.</span>
          </label>
        </div>

        <div className="panel step" style={{ marginTop: 16 }}>
          <div className="step-h">
            <span className="n">04</span>
            <h2>Give it a face</h2>
            <span className="muted">optional</span>
          </div>
          <label className="field">
            Describe its character
            <textarea
              className="input"
              rows={3}
              maxLength={400}
              placeholder="a round felt owl in a field cap with brass binoculars, at a night-watch desk full of glowing charts"
              value={face}
              onChange={(e) => setFace(e.target.value)}
            />
            <span className="hint">Characters only, no real people. We draw three options and you pick one.</span>
          </label>
          <button className="btn" type="button" disabled={face.trim().length < 8} onClick={() => toast("Drawing runs on Cradle's servers. This preview keeps your description only.")}>
            Draw 3 options
          </button>
        </div>

        <div className="panel step" style={{ marginTop: 16 }}>
          <div className="step-h">
            <span className="n">05</span>
            <h2>First buy</h2>
          </div>
          <label className="field">
            ETH
            <input className="input mono" inputMode="decimal" value={firstBuy} onChange={(e) => setFirstBuy(e.target.value.replace(/[^0-9.]/g, ""))} />
            <span className="hint">Optional. Bought in the launch transaction at the opening price, so nobody can buy ahead of you.</span>
          </label>
        </div>
      </div>

      <aside className="panel preview">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {image ? <Sigil address="preview" image={image} size={48} /> : <Mark size={48} />}
          <div>
            <b style={{ fontSize: 18 }}>{name.trim() || "Unnamed"}</b>
            <div className="muted mono">${symbol.trim() || "TICKER"}</div>
          </div>
        </div>
        <dl className="kv">
          <dt>Model</dt>
          <dd>{chosen?.id?.split("/").pop() || "—"}</dd>
          <dt>Brief</dt>
          <dd>{brief.trim() ? "custom" : presetObj?.label}</dd>
          <dt>On air</dt>
          <dd>{face.trim() ? "text only" : "no character"}</dd>
          <dt>Supply</dt>
          <dd>1B · 79.3% on curve</dd>
          <dt>Starting market cap</dt>
          <dd>{money(mcap0)}</dd>
          <dt>Your first buy</dt>
          <dd>{quoted ? `${compact(quoted.out)} (${((quoted.out / SUPPLY) * 100).toFixed(2)}%)` : "—"}</dd>
          <dt>Trade fee</dt>
          <dd>1.5% forever</dd>
          <dt>Launch fee</dt>
          <dd>none</dd>
          <dt>You earn</dt>
          <dd>0.2% of every trade</dd>
        </dl>
        <button className="btn glow block" type="button" onClick={launch}>
          Connect wallet to launch
        </button>
        <p className="muted" style={{ fontSize: 12, margin: 0 }}>
          Graduates to Uniswap v4 after about 2.83 ETH of buys. Liquidity is locked forever and the 1.5% keeps flowing through a hook.
        </p>
      </aside>
    </div>
  );
}
