import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const vapiDebugLogger = (): Plugin => ({
  name: "vapi-debug-logger",
  configureServer(server) {
    server.middlewares.use("/__vapi-debug", (req, res, next) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end();
        return;
      }

      const chunks: Buffer[] = [];
      req.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      req.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8") || "{}";
        try {
          const parsed = JSON.parse(raw) as {
            level?: string;
            timestamp?: string;
            messages?: unknown[];
          };
          const level = parsed.level ?? "debug";
          const ts = parsed.timestamp ?? new Date().toISOString();
          console.log(
            `[VapiClient:${level}] ${ts}`,
            ...(Array.isArray(parsed.messages) ? parsed.messages : [parsed]),
          );
        } catch (error) {
          console.log("[VapiClient:warn] Failed to parse debug payload", raw, error);
        }
        res.statusCode = 204;
        res.end();
      });

      req.on("error", (error) => {
        console.error("[VapiClient:error] Debug stream error", error);
        res.statusCode = 500;
        res.end();
      });
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && vapiDebugLogger(),
  ].filter(Boolean) as Plugin[],
  envPrefix: ["VITE_", "MAPBOX_"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
