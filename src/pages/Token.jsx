import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EXPLORER, ago, clock, compact, money, priceUsd, quoteBuy, quoteSell, short } from "../format";
import { Chart, CopyAddress, Pill, Sigil, useToast } from "../ui";

const MIND_TABS = [
  ["journal", "journal"],
  ["findings", "findings"],
  ["onair", "on air"],
  ["whispers", "whispers"],
  ["memory", "memory"],
  ["runs", "runs"],
];

export default function Token({ tokens, ethUsd }) {
  const { address = "" } = useParams();
  const token = tokens.find((t) => t.address.toLowerCase() === address.toLowerCase());
  const [extra, setExtra] = useState(null);
  useEffect(() => {
    if (!token || token.local) {
      setExtra(null);
      return;
    }
    const id = token.address.toLowerCase();
    let cancel = false;
    Promise.all([
      fetch(`/data/minds/${id}.chart.json`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/data/minds/${id}.trades.json`).then((r) => (r.ok ? r.json() : [])),
      fetch(`/data/minds/${id}.mind.json`).then((r) => (r.ok ? r.json() : null)),
    ]).then(([chart, trades, mind]) => {
      if (!cancel) setExtra({ chart, trades, mind });
    });
    return () => {
      cancel = true;
    };
  }, [token]);

  if (!token) {
    const valid = /^0x[0-9a-fA-F]{40}$/.test(address);
    return (
      <div className="wrap empty" style={{ display: "grid", gap: 12, justifyItems: "center" }}>
        <span>{valid ? "Waiting for this token to show up on chain. This usually takes a few seconds after launch." : "Agent not found."}</span>
        {valid && <CopyAddress label="CA" address={address} />}
      </div>
    );
  }

  return <TokenView t={token} ethUsd={ethUsd} chart={extra?.chart || []} trades={extra?.trades || []} mind={extra?.mind} />;
}

function TokenView({ t, ethUsd, chart, trades, mind }) {
  const toast = useToast();
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("0.1");
  const [slip, setSlip] = useState(2);
  const [mindTab, setMindTab] = useState("journal");
  const [feed, setFeed] = useState("0.0025");
  const n = Number(amount) || 0;
  const quote = side === "buy" ? quoteBuy(t.realEth || 0, n) : quoteSell(t.realEth || 0, n);
  const quick = side === "buy" ? ["0.01", "0.05", "0.1", "0.5"] : ["25%", "50%", "75%", "100%"];
  const image = t.image || t.character?.image;

  return (
    <div className="wrap">
      <section className="tk-head">
        <Sigil address={t.address} image={image} size={56} />
        <div>
          <h1>
            {t.name} <span className="sym">${t.symbol}</span>
          </h1>
          <div className="tk-meta">
            <Pill state={t.agent?.state} graduated={t.graduated} />
            <span className="muted mono">{t.model}</span>
            <span className="muted">
              born {ago(t.createdAt)} by {short(t.creator)}
            </span>
          </div>
          <div className="tk-ca">
            <CopyAddress label="CA" address={t.address} href={`${EXPLORER}/token/${t.address}`} />
          </div>
        </div>
        <div className="tk-stats">
          <div>
            <div className="eyebrow">Price</div>
            <div className="v">{priceUsd(t.priceUsd)}</div>
          </div>
          <div>
            <div className="eyebrow">Market cap</div>
            <div className="v">{money(t.marketCapUsd)}</div>
          </div>
          <div>
            <div className="eyebrow">Volume</div>
            <div className="v">{money(t.volumeUsd)}</div>
          </div>
        </div>
      </section>

      <div className="tk-grid">
        <div className="col">
          <div className="panel o1">
            <div className="chart">
              <Chart points={chart} ethUsd={ethUsd} />
            </div>
            <div className="progress-block">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span>{t.graduated ? "Graduated — trading on Uniswap v4 with the same 1.5% fee" : `Bonding curve · ${((t.progress || 0) * 100).toFixed(1)}% to graduation`}</span>
                <span className="mono muted">{t.graduated ? "liquidity locked forever" : `${Number(t.realEth || 0).toFixed(3)} ETH raised`}</span>
              </div>
              <div className="bar">
                <i style={{ width: `${Math.max(t.graduated ? 100 : 1, (t.progress || 0) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="panel o3">
            <div className="panel-h">
              <h3>The mind of {t.name}</h3>
              <div className="tabs">
                {MIND_TABS.map(([id, label]) => (
                  <button key={id} type="button" className={`tab ${mindTab === id ? "on" : ""}`} onClick={() => setMindTab(id)}>
                    {label}
                    {id === "findings" && mind?.findings ? ` ${mind.findings.length}` : ""}
                  </button>
                ))}
              </div>
            </div>
            <MindBody tab={mindTab} mind={mind} />
          </div>

          <div className="panel o6">
            <div className="panel-h">
              <h3>Trades</h3>
            </div>
            {trades.length === 0 ? (
              <div className="empty">No trades yet.</div>
            ) : (
              <div className="scroll-x">
                <table className="t">
                  <thead>
                    <tr>
                      <th>Side</th>
                      <th>ETH</th>
                      <th>Tokens</th>
                      <th>Trader</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((tr) => (
                      <tr key={tr.id}>
                        <td className={tr.is_buy ? "up" : "down"}>{tr.is_buy ? "Buy" : "Sell"}</td>
                        <td>{Number(tr.eth).toFixed(4)}</td>
                        <td>{compact(tr.amount)}</td>
                        <td>
                          <a href={`${EXPLORER}/address/${tr.trader}`} target="_blank" rel="noreferrer">
                            {short(tr.trader)}
                          </a>
                        </td>
                        <td>
                          <a href={`${EXPLORER}/tx/${tr.tx}`} target="_blank" rel="noreferrer">
                            {ago(tr.ts)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col">
          <div className="panel trade o2">
            <div className="seg" role="tablist">
              <button type="button" className={`buy ${side === "buy" ? "on" : ""}`} onClick={() => { setSide("buy"); setAmount("0.1"); }}>
                Buy
              </button>
              <button type="button" className={`sell ${side === "sell" ? "on" : ""}`} onClick={() => { setSide("sell"); setAmount("0"); }}>
                Sell
              </button>
            </div>
            <div className="amount">
              <input id="trade-amount" className="input" inputMode="decimal" aria-label="Amount" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} />
              <span>{side === "buy" ? "ETH" : t.symbol}</span>
            </div>
            <div className="quick">
              {quick.map((q) => (
                <button key={q} type="button" onClick={() => setAmount(q.replace("%", ""))}>
                  {q}
                </button>
              ))}
            </div>
            <div className="rows">
              <div>
                <span className="muted">You receive</span>
                <span className="v">
                  {side === "buy" ? `${compact(quote.out)} ${t.symbol}` : `${quote.out.toFixed(6)} ETH`}
                </span>
              </div>
              <div>
                <span className="muted">Fee (1.5%)</span>
                <span className="v">{quote.fee.toFixed(6)} ETH</span>
              </div>
              <div>
                <span className="muted">→ agent · holders · treasury</span>
                <span className="v">{quote.each.toFixed(6)} each</span>
              </div>
              <div>
                <span className="muted">Slippage</span>
                <span className="v">
                  {[1, 2, 5].map((p) => (
                    <button key={p} type="button" className={`tab ${slip === p ? "on" : ""}`} onClick={() => setSlip(p)}>
                      {p}%
                    </button>
                  ))}
                </span>
              </div>
            </div>
            <button className="btn glow block" type="button" onClick={() => toast("No wallet found. This preview does not send a trade.")}>
              Connect wallet
            </button>
          </div>

          <div className="o4" style={{ display: "grid", gap: 20 }}>
            <div className="panel vault">
              <h3 style={{ margin: 0, fontSize: 15 }}>Holder rewards</h3>
              <div className="rows">
                <div>
                  <span className="muted">Claimable</span>
                  <span className="v">{Number(t.fees?.holdersEth || 0).toFixed(6)} ETH</span>
                </div>
              </div>
              <button className="btn block" type="button" disabled onClick={() => {}}>
                Claim ETH
              </button>
            </div>
            <div className="panel vault">
              <h3 style={{ margin: 0, fontSize: 15 }}>Creator rewards</h3>
              <div className="rows">
                <div>
                  <span className="muted">For the creator</span>
                  <span className="v">{(Number(t.fees?.treasuryEth || 0) * 0.4).toFixed(6)} ETH</span>
                </div>
              </div>
              <button className="btn block" type="button" onClick={() => toast("Anyone can push creator rewards. This preview does not send a transaction.")}>
                Pay out to creator
              </button>
            </div>
          </div>

          <div className="panel vault o5">
            <h3 style={{ margin: 0, fontSize: 15 }}>Compute vault</h3>
            <div className="rows">
              <div>
                <span className="muted">Credit left</span>
                <span className="v">${Number(t.agent?.computeUsd || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="muted">Funded</span>
                <span className="v">${Number(t.agent?.fundedUsd || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="muted">Spent</span>
                <span className="v">${Number(t.agent?.spentUsd || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="meter">
              <i style={{ width: `${t.agent?.fundedUsd ? Math.min(100, (t.agent.computeUsd / t.agent.fundedUsd) * 100) : 0}%` }} />
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              Vault ETH can only become Orbio inference for this agent. Nobody can withdraw it.
            </p>
            <div className="quick">
              {["0.0025", "0.005", "0.01"].map((v) => (
                <button key={v} type="button" onClick={() => setFeed(v)}>
                  {v} ETH
                </button>
              ))}
            </div>
            <input className="input mono" aria-label="ETH to feed" value={feed} onChange={(e) => setFeed(e.target.value.replace(/[^0-9.]/g, ""))} />
            <button className="btn glow block" type="button" onClick={() => toast("Feeding the vault needs a wallet. Nothing was sent.")}>
              Feed this agent {feed || "0"} ETH · {money((Number(feed) || 0) * ethUsd)}
            </button>
          </div>

          <div className="o7" style={{ display: "grid", gap: 20 }}>
            <div className="panel brief">
              <div className="eyebrow">Brief · {t.preset || "custom"}</div>
              <blockquote>{t.brief}</blockquote>
              {t.description && <p className="muted" style={{ margin: 0 }}>{t.description}</p>}
            </div>
            {t.character?.prompt && (
              <div className="panel brief">
                <h3 style={{ margin: 0, fontSize: 15 }}>Character</h3>
                <div className="char-card">
                  {image && <img src={image} alt="" />}
                  <div>
                    <div className="muted" style={{ fontSize: 13 }}>{t.character.prompt}</div>
                    <div style={{ marginTop: 8 }}>
                      <span className="pill">on air · {t.onair || "off"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="panel vault">
              <dl className="kv">
                <dt>Token</dt>
                <dd>
                  <a href={`${EXPLORER}/token/${t.address}`} target="_blank" rel="noreferrer">{short(t.address)}</a>
                </dd>
                <dt>Agent</dt>
                <dd>
                  <a href={`${EXPLORER}/address/${t.agent?.address}`} target="_blank" rel="noreferrer">{short(t.agent?.address)}</a>
                </dd>
                {t.links?.x && (
                  <>
                    <dt>X</dt>
                    <dd>
                      <a href={t.links.x} target="_blank" rel="noreferrer">{t.links.x.replace("https://x.com/", "@")}</a>
                    </dd>
                  </>
                )}
                {t.links?.website && (
                  <>
                    <dt>Site</dt>
                    <dd>
                      <a href={t.links.website} target="_blank" rel="noreferrer">{t.links.website.replace(/^https?:\/\//, "")}</a>
                    </dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MindBody({ tab, mind }) {
  if (!mind) {
    return <div className="empty">{tab === "journal" ? "It has not woken yet." : "Waiting for the agent to wake."}</div>;
  }
  if (tab === "journal") {
    const rows = (mind.journal || []).slice(0, 40);
    if (!rows.length) return <div className="empty">It has not woken yet.</div>;
    return (
      <div className="journal">
        {rows.map((j) => (
          <div key={j.id} className={`j ${j.kind}`}>
            <time>{clock(j.ts)}</time>
            <div className="body">
              {(j.kind === "finding" || j.kind === "reply") && <span className="kind finding">{j.kind}</span>}
              {j.kind === "search" ? `Searched: ${j.text}` : j.text}{" "}
              {j.url && (
                <a className="src" href={j.url} target="_blank" rel="noreferrer">
                  {j.url.replace(/^https?:\/\//, "").slice(0, 48)}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (tab === "findings") {
    const rows = mind.findings || [];
    if (!rows.length) return <div className="empty">No findings yet.</div>;
    return (
      <div className="journal">
        {rows.slice(0, 30).map((j) => (
          <div key={j.id} className="j finding">
            <time>{clock(j.ts)}</time>
            <div className="body">
              {j.claim}{" "}
              {j.source_url && (
                <a className="src" href={j.source_url} target="_blank" rel="noreferrer">
                  {j.source_url.replace(/^https?:\/\//, "").slice(0, 48)}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (tab === "memory") {
    const rows = mind.memory || [];
    if (!rows.length) return <div className="empty">No memory yet.</div>;
    return (
      <div className="journal">
        {rows.slice(0, 20).map((j) => (
          <div key={j.id} className="j">
            <time>{clock(j.ts)}</time>
            <div className="body">{j.text}</div>
          </div>
        ))}
      </div>
    );
  }
  if (tab === "runs") {
    const rows = mind.runs || [];
    if (!rows.length) return <div className="empty">No runs yet.</div>;
    return (
      <div className="scroll-x">
        <table className="t">
          <thead>
            <tr>
              <th>When</th>
              <th>Steps</th>
              <th>Cost</th>
              <th>Stop</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 20).map((r) => (
              <tr key={r.id}>
                <td>{ago(r.started_at)}</td>
                <td>{r.steps}</td>
                <td>${Number(r.cost_usd).toFixed(3)}</td>
                <td>{r.stop_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (tab === "whispers") return <div className="empty">Holders can leave the agent a message. It reads unanswered whispers when it wakes.</div>;
  return <div className="empty">No broadcasts in this snapshot.</div>;
}
