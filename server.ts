import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import url from "node:url";
import { createServer as createViteServer } from "vite";
import { JoyceMarketStore } from "./src/joyce_store";
import type {
  KinshasaCommune,
  MarketCategory,
  PaymentMethod,
  SellerPlanId,
} from "./src/types/market";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(data));
}

async function readJsonBody<T>(req: http.IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > 128 * 1024) {
      throw new Error("Requête trop volumineuse.");
    }
    chunks.push(buf);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return (raw ? JSON.parse(raw) : {}) as T;
}

function tryServeStaticFile(req: http.IncomingMessage, res: http.ServerResponse, baseDir: string): boolean {
  const reqPath = (req.url || "/").split("?")[0];
  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, "");
  const fullPath = path.join(baseDir, safePath === "/" ? "index.html" : safePath);
  if (!fullPath.startsWith(baseDir)) return false;
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) return false;
  const ext = path.extname(fullPath).toLowerCase();
  res.statusCode = 200;
  res.setHeader("content-type", MIME_TYPES[ext] || "application/octet-stream");
  fs.createReadStream(fullPath).pipe(res);
  return true;
}

async function startServer() {
  const store = new JoyceMarketStore(path.join(__dirname, "data"));
  const isProd = process.env.NODE_ENV === "production";
  const distDir = path.join(__dirname, "dist");
  const publicDir = path.join(__dirname, "public");

  const httpServer = http.createServer();

  let viteMiddleware: ((req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => void) | null =
    null;

  if (!isProd || !fs.existsSync(path.join(distDir, "index.html"))) {
    const vite = await createViteServer({
      root: __dirname,
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
        allowedHosts: true,
      },
      appType: "spa",
    });
    viteMiddleware = vite.middlewares;
  }

  httpServer.on("request", async (req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://localhost:${PORT}`);
    const urlPath = parsedUrl.pathname;

    if (urlPath.startsWith("/api/")) {
      try {
        if (req.method === "GET" && urlPath === "/api/market/bootstrap") {
          return sendJson(res, 200, store.getBootstrap());
        }

        if (req.method === "POST" && urlPath === "/api/market/orders") {
          const body = await readJsonBody<{
            customerName: string;
            customerPhone: string;
            commune: KinshasaCommune;
            addressNote: string;
            paymentMethod: PaymentMethod;
            items: { productId: string; variant: string; quantity: number }[];
          }>(req);
          return sendJson(res, 200, store.createOrder(body));
        }

        if (req.method === "POST" && urlPath === "/api/market/orders/advance") {
          const body = await readJsonBody<{ orderId: string }>(req);
          return sendJson(res, 200, store.advanceOrderStatus(body.orderId));
        }

        if (req.method === "POST" && urlPath === "/api/market/products") {
          const body = await readJsonBody<{
            title: string;
            category: MarketCategory;
            priceUsd: number;
            commune: KinshasaCommune;
            sellerName: string;
            sellerWhatsapp: string;
            description: string;
            variantsText: string;
            imageUrl: string;
            promote: boolean;
          }>(req);
          return sendJson(res, 200, store.publishProduct(body));
        }

        if (req.method === "POST" && urlPath === "/api/market/products/promote") {
          const body = await readJsonBody<{ productId: string }>(req);
          return sendJson(res, 200, store.togglePromoteProduct(body.productId));
        }

        if (req.method === "POST" && urlPath === "/api/market/seller/plan") {
          const body = await readJsonBody<{ planId: SellerPlanId }>(req);
          return sendJson(res, 200, store.updateSellerPlan(body.planId));
        }

        return sendJson(res, 404, { ok: false, error: "Endpoint introuvable." });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur serveur.";
        return sendJson(res, 400, { ok: false, error: msg });
      }
    }

    if (viteMiddleware) {
      viteMiddleware(req, res, () => {
        if (!res.headersSent) {
          res.statusCode = 404;
          res.end("Not Found");
        }
      });
      return;
    }

    if (tryServeStaticFile(req, res, distDir)) return;
    if (tryServeStaticFile(req, res, publicDir)) return;

    const indexPath = path.join(distDir, "index.html");
    if (fs.existsSync(indexPath)) {
      res.statusCode = 200;
      res.setHeader("content-type", "text/html; charset=utf-8");
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.statusCode = 404;
    res.end("Not Found");
  });

  httpServer.listen(PORT, HOST, () => {
    console.log(`JOYCE MARKET 243 server listening on http://${HOST}:${PORT}`);
  });
}

void startServer();
