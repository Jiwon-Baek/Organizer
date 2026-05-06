import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "web");
const outFile = path.join(outDir, "organizer-single.html");

const moduleOrder = [
  "style.js",
  "i18n.js",
  "storage.js",
  "search.js",
  "dashboard.js",
  "pdf_viewer.js",
  "scripts.js",
];

function stripModuleSyntax(source) {
  return source
    .replace(/import\s+\{[\s\S]*?\}\s+from\s+["'][^"']+["'];\n/g, "")
    .replace(/^import\s+[^;\n]+;\n/gm, "")
    .replace(/^export\s+\{[^}]+\};\n?/gm, "")
    .replace(/\bexport\s+(const|let|var|function|async function|class)\s+/g, "$1 ");
}

function mimeType(filePath) {
  if (filePath.endsWith(".ttf")) return "font/ttf";
  if (filePath.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

async function toDataUrl(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  const content = await fs.readFile(absolutePath);
  return `data:${mimeType(relativePath)};base64,${content.toString("base64")}`;
}

async function inlineAssets(source) {
  const assetPaths = [
    "assets/fonts/NanumGothic.ttf",
    "assets/fonts/NanumGothic-Bold.ttf",
    "assets/fonts/Freesentation-4Regular.ttf",
    "assets/fonts/Freesentation-7Bold.ttf",
    "sample/samplePDF_1.pdf",
    "sample/samplePDF_2.pdf",
    "sample/samplePDF_3.pdf",
    "sample/samplePDF_4.pdf",
  ];

  let bundled = source;
  for (const assetPath of assetPaths) {
    const dataUrl = await toDataUrl(assetPath);
    bundled = bundled
      .replaceAll(`./${assetPath}`, dataUrl)
      .replaceAll(`'${assetPath}'`, `'${dataUrl}'`)
      .replaceAll(`"${assetPath}"`, `"${dataUrl}"`);
  }
  return bundled;
}

async function build() {
  const parts = [];
  for (const moduleName of moduleOrder) {
    const source = await fs.readFile(path.join(rootDir, moduleName), "utf8");
    parts.push(`\n// ${moduleName}\n${stripModuleSyntax(source)}`);
  }

  const script = await inlineAssets(parts.join("\n"));
  const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Organizer Web Test</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
${script}
    </script>
  </body>
</html>
`;

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, html, "utf8");
  const stat = await fs.stat(outFile);
  console.log(`Wrote ${outFile} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
