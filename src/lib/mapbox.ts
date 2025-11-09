const FALLBACK_TOKEN =
  "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtM3I2ODJ5aTBqanEyanM5bzg0aWd2eXMifQ.b8bH9JxHXrLWDPzTqCGfQg";

const getEnvToken = () => {
  const candidates = [
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    import.meta.env.MAPBOX_ACCESS_TOKEN,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return undefined;
};

export const getMapboxToken = () => {
  const envToken = getEnvToken();
  return envToken ?? FALLBACK_TOKEN;
};

export const hasCustomMapboxToken = () => Boolean(getEnvToken());

export const MAPBOX_FALLBACK_TOKEN = FALLBACK_TOKEN;

