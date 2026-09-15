const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
if (!fs.existsSync(distDir)) {
  console.error("[postbuild-web] dist/ no existe. Corre `expo export --platform web` primero.");
  process.exit(1);
}

const redirects = "/*    /index.html    200\n";
fs.writeFileSync(path.join(distDir, "_redirects"), redirects, "utf8");

const headers =
  "/sql-wasm.wasm\n  Content-Type: application/wasm\n  Cache-Control: public, max-age=31536000, immutable\n";
fs.writeFileSync(path.join(distDir, "_headers"), headers, "utf8");

console.log("[postbuild-web] _redirects y _headers escritos en dist/");
