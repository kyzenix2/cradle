import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Shell, ToastProvider } from "./ui";
import Home from "./pages/Home";
import Launch from "./pages/Launch";
import Stake from "./pages/Stake";
import Models from "./pages/Models";
import Docs from "./pages/Docs";
import Token from "./pages/Token";

const LOCAL_KEY = "cradle-preview-tokens";

export default function App() {
  const [data, setData] = useState(null);
  const [local, setLocal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    Promise.all([
      fetch("/data/tokens.json").then((r) => r.json()),
      fetch("/data/stats.json").then((r) => r.json()),
      fetch("/data/feed.json").then((r) => r.json()),
      fetch("/data/models.json").then((r) => r.json()),
      fetch("/data/config.json").then((r) => r.json()),
    ]).then(([tokens, stats, feed, models, config]) => {
      setData({ tokens, stats, feed, models: models.models || [], presets: config.presets || [], ethUsd: config.ethUsd || stats.ethUsd || 2677 });
    });
  }, []);

  function launch(token) {
    const next = [token, ...local];
    setLocal(next);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  }

  const tokens = data ? [...local, ...data.tokens] : [];
  const stats = data
    ? { ...data.stats, tokens: data.stats.tokens + local.length }
    : null;

  return (
    <ToastProvider>
      <Shell>
        {!data ? (
          <div className="wrap empty">Loading Cradle…</div>
        ) : (
          <Routes>
            <Route path="/" element={<Home tokens={tokens} stats={stats} feed={data.feed} />} />
            <Route path="/launch" element={<Launch models={data.models} presets={data.presets} ethUsd={data.ethUsd} onLaunch={launch} />} />
            <Route path="/stake" element={<Stake />} />
            <Route path="/models" element={<Models models={data.models} />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/t/:address" element={<Token tokens={tokens} ethUsd={data.ethUsd} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </Shell>
    </ToastProvider>
  );
}
