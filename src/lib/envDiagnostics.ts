const maskValue = (value: unknown) => {
  if (typeof value !== "string") {
    return value === undefined ? "missing" : "non-string";
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "empty string";
  }

  if (trimmed.length <= 8) {
    return `set (${trimmed})`;
  }

  return `set (${trimmed.slice(0, 4)}…${trimmed.slice(-4)} | len=${trimmed.length})`;
};

const collectSnapshot = (envSource: Record<string, any> | undefined, keys: string[]) => {
  if (!envSource) return {};

  return keys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = maskValue(envSource[key]) as string;
    return acc;
  }, {});
};

export const logClientEnvDiagnostics = () => {
  if (typeof window === "undefined") {
    return;
  }

  const importantKeys = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "VITE_BACKEND_URL",
    "VITE_BACKEND_WS_URL",
    "VITE_MAPBOX_ACCESS_TOKEN",
    "MAPBOX_ACCESS_TOKEN",
    "VITE_VAPI_PUBLIC_KEY",
    "VITE_VAPI_ASSISTANT_ID",
    "VITE_VAPI_API_URL",
  ];

  const importMetaEnv = (typeof import.meta !== "undefined" && (import.meta as any).env) || {};
  const windowEnv = (window as any).__ENV__ || {};

  const snapshot = {
    mode: importMetaEnv.MODE,
    base: importMetaEnv.BASE,
    hasWindowEnv: Boolean(windowEnv && Object.keys(windowEnv).length),
    importMetaKeys: collectSnapshot(importMetaEnv, importantKeys),
    windowEnvKeys: collectSnapshot(windowEnv, importantKeys),
  };

  const alreadyLogged = (window as any).__ENV_DEBUG_LOGGED__;
  if (alreadyLogged && importMetaEnv.PROD) {
    return;
  }

  if (!alreadyLogged) {
    console.groupCollapsed?.("🔍 Env Diagnostics (client)");
    console.info("Runtime context", {
      mode: snapshot.mode,
      base: snapshot.base,
      hasWindowEnv: snapshot.hasWindowEnv,
    });
    console.info("import.meta.env key status", snapshot.importMetaKeys);
    if (snapshot.hasWindowEnv) {
      console.info("window.__ENV__ key status", snapshot.windowEnvKeys);
    } else {
      console.info("window.__ENV__ not detected");
    }
    console.groupEnd?.();
    (window as any).__ENV_DEBUG_LOGGED__ = true;
  } else if (!importMetaEnv.PROD) {
    // Update log in development when hot reloading
    console.info("🔁 Env Diagnostics update", {
      importMeta: snapshot.importMetaKeys,
      windowEnv: snapshot.windowEnvKeys,
    });
  }
};


