// scripts/fix-import-meta.js
//
// Expo Web 导出后，某些第三方依赖会在 bundle 中残留 `import.meta.env`，
// 在浏览器以普通 script（非 ES module）执行时代码会触发
// "SyntaxError: import.meta is only valid inside modules"。
//
// 这个小脚本会在 `dist/_expo/static/js/web/entrypoint-*.js` 中
// 把 `import.meta.env ? import.meta.env.MODE : void 0` 替换成字符串字面量
// `'production'`，从而避免语法错误，同时在生产环境下禁用对应的 dev‑only 逻辑。

const fs = require("fs");
const path = require("path");

const WEB_BUNDLE_DIR = path.join(
  __dirname,
  "..",
  "dist",
  "_expo",
  "static",
  "js",
  "web",
);

function patchEntryFiles() {
  if (!fs.existsSync(WEB_BUNDLE_DIR)) {
    console.warn(
      "[fix-import-meta] web bundle directory not found, skip patch:",
      WEB_BUNDLE_DIR,
    );
    return;
  }

  const files = fs
    .readdirSync(WEB_BUNDLE_DIR)
    .filter(
      (name) =>
        name.startsWith("entrypoint-") && name.endsWith(".js"),
    );

  if (files.length === 0) {
    console.warn(
      "[fix-import-meta] no entrypoint-*.js files found under",
      WEB_BUNDLE_DIR,
    );
    return;
  }

  const PATTERN =
    /import\.meta\.env\s*\?\s*import\.meta\.env\.MODE\s*:\s*void\s*0/g;

  for (const file of files) {
    const fullPath = path.join(WEB_BUNDLE_DIR, file);
    const code = fs.readFileSync(fullPath, "utf8");

    if (!PATTERN.test(code)) {
      // 文件里没有 import.meta.env，就不改
      continue;
    }

    const patched = code.replace(PATTERN, "'production'");
    fs.writeFileSync(fullPath, patched, "utf8");

    console.log(
      `[fix-import-meta] patched import.meta.env in ${path.relative(
        process.cwd(),
        fullPath,
      )}`,
    );
  }
}

patchEntryFiles();


