import { app as n, BrowserWindow as r } from "electron";
import e from "node:path";
import { fileURLToPath as c } from "node:url";
const s = e.dirname(c(import.meta.url));
process.env.APP_ROOT = e.join(s, "..");
const i = process.env.VITE_DEV_SERVER_URL, R = e.join(process.env.APP_ROOT, "dist-electron"), t = e.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? e.join(process.env.APP_ROOT, "public") : t;
let o;
function l() {
  o = new r({
    icon: e.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: e.join(s, "preload.mjs")
    }
  }), i ? o.loadURL(i) : o.loadFile(e.join(t, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), o = null);
});
n.on("activate", () => {
  r.getAllWindows().length === 0 && l();
});
n.whenReady().then(l);
export {
  R as MAIN_DIST,
  t as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
