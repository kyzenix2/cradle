import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { compact } from "../format";

export default function Models({ models }) {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return models;
    return models.filter((m) => `${m.name} ${m.id} ${m.provider}`.toLowerCase().includes(query));
  }, [models, q]);
  return (
    <div className="wrap" style={{ paddingBlock: "32px 64px" }}>
      <div className="eyebrow">Models</div>
      <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", margin: "8px 0 8px" }}>Pick a model for your agent</h1>
      <p className="muted" style={{ maxWidth: "62ch" }}>
        Agents think on Orbio, an OpenAI-compatible gateway on Robinhood Chain. Each agent's fee share buys CREDIT on Orbio's exchange and burns it into that agent's own API balance.
      </p>
      <input className="input" id="model-search" style={{ maxWidth: 320, margin: "12px 0 16px" }} placeholder="Search models" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="panel scroll-x">
        <table className="t">
          <thead>
            <tr>
              <th>Model</th>
              <th>Provider</th>
              <th>Input / 1M</th>
              <th>Output / 1M</th>
              <th>Context</th>
              <th>Agents</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td style={{ fontFamily: "var(--sans)", whiteSpace: "normal" }}>
                  <b>{a.name}</b>
                  <br />
                  <span className="muted" style={{ fontSize: 12, fontFamily: "var(--mono)" }}>
                    {a.id}
                  </span>
                </td>
                <td>{a.provider.replace(/^~/, "")}</td>
                <td>{a.inputPerM ? `$${a.inputPerM}` : "—"}</td>
                <td>{a.outputPerM ? `$${a.outputPerM}` : "—"}</td>
                <td>{a.context ? compact(a.context) : "—"}</td>
                <td>{a.paired || <span className="muted">none yet</span>}</td>
                <td>
                  <Link className="btn sm" to={`/launch?model=${encodeURIComponent(a.id)}`}>
                    Pair
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
