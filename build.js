/* Inline core.js + ui.js into a single offline play.html. Run: node build.js */
const fs = require("fs");
const path = require("path");
const root = __dirname;
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const core = fs.readFileSync(path.join(root, "src/core.js"), "utf8");
const ui = fs.readFileSync(path.join(root, "src/ui.js"), "utf8");

const out = html
  .replace('<script src="src/core.js"></script>', "<script>\n" + core + "\n</script>")
  .replace('<script src="src/ui.js"></script>', "<script>\n" + ui + "\n</script>");

if (out.includes('src="src/')) { console.error("FAILED: leftover external script refs"); process.exit(1); }
fs.writeFileSync(path.join(root, "play.html"), out);
console.log("play.html written:", (Buffer.byteLength(out) / 1024).toFixed(1) + " KB");
