import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initObservability } from "./lib/observability";

function renderBootError(message: string) {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;background:#070d16;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,Segoe UI,Arial">
      <div style="max-width:860px;width:100%;border:1px solid rgba(248,113,113,.45);background:rgba(127,29,29,.18);padding:18px;border-radius:12px">
        <h2 style="margin:0 0 8px 0;font-size:22px">⚠️ Erreur de démarrage</h2>
        <p style="margin:0 0 10px 0;opacity:.9">Le jeu a rencontré une erreur au démarrage.</p>
        <pre style="white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,.35);padding:10px;border-radius:8px;font-size:12px">${message}</pre>
        <p style="opacity:.8;font-size:12px;margin-top:10px">Astuce: hard refresh (Ctrl+F5) ou navigation privée. Reset save: <code>?reset_save=1</code></p>
      </div>
    </div>
  `;
}

const clearLocalSave = () => {
  try {
    localStorage.removeItem("td_save_v1");
  } catch (error) {
    console.warn("[boot] impossible de supprimer la sauvegarde locale", error);
  }
};

const url = new URL(window.location.href);
if (url.searchParams.get("reset_save") === "1") {
  clearLocalSave();
  url.searchParams.delete("reset_save");
  window.location.replace(url.toString());
}

try {
  const raw = localStorage.getItem("td_save_v1");
  if (raw) JSON.parse(raw);
} catch {
  clearLocalSave();
}

window.addEventListener("error", (e) => {
  const msg = (e.error && e.error.stack) || e.message || "Unknown startup error";
  renderBootError(msg);
});

window.addEventListener("unhandledrejection", (e) => {
  const reason = (e.reason && (e.reason.stack || e.reason.message)) || String(e.reason || "Unhandled rejection");
  renderBootError(reason);
});

try {
  initObservability();
  const el = document.getElementById("root");
  if (!el) throw new Error("Missing #root element");
  createRoot(el).render(<App />);
} catch (err: unknown) {
  const message = err instanceof Error ? (err.stack || err.message) : String(err);
  renderBootError(message);
}
