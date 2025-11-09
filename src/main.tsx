import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logClientEnvDiagnostics } from "./lib/envDiagnostics.ts";

if (import.meta.env.DEV) {
  logClientEnvDiagnostics();
}

createRoot(document.getElementById("root")!).render(<App />);
