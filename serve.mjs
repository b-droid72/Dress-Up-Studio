import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = __dirname;
const port = Number(process.env.PORT || 8000);

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"]
]);

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const cleaned = decoded.replaceAll("\\", "/");
  const joined = path.join(base, cleaned);
  const normalizedBase = path.resolve(base) + path.sep;
  const normalizedJoined = path.resolve(joined);
  if (!normalizedJoined.startsWith(normalizedBase)) return null;
  return normalizedJoined;
}

function send(res, code, body, headers = {}) {
  res.writeHead(code, headers);
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;

    const filePath = safeJoin(root, pathname);
    if (!filePath) return send(res, 400, "Bad request");

    const st = await stat(filePath).catch(() => null);
    if (!st || !st.isFile()) return send(res, 404, "Not found");

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mime.get(ext) ?? "application/octet-stream";
    const body = await readFile(filePath);
    send(res, 200, body, { "Content-Type": contentType });
  } catch {
    send(res, 500, "Server error");
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Serving ${root} at http://localhost:${port}`);
});

