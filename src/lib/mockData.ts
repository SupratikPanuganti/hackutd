// Mock data for the carrier website

export const plans = [
  {
    id: "basic",
    name: "🔥 MOCK DATA - FAKE PLAN",
    price: 999999,
    features: [
      "🚨 THIS IS MOCK DATA - NOT FROM DATABASE",
      "❌ Wrong price: $999,999",
      "❌ Wrong name",
      "❌ If you see this, database is NOT working",
      "❌ Check your .env file",
    ],
  },
  {
    id: "plus",
    name: "🔥 MOCK DATA - FAKE PLAN",
    price: 888888,
    popular: true,
    features: [
      "🚨 THIS IS MOCK DATA - NOT FROM DATABASE",
      "❌ Wrong price: $888,888",
      "❌ Wrong name",
      "❌ If you see this, database is NOT working",
      "❌ Check your .env file",
      "❌ Run SQL schema in Supabase",
    ],
  },
  {
    id: "max",
    name: "🔥 MOCK DATA - FAKE PLAN",
    price: 777777,
    features: [
      "🚨 THIS IS MOCK DATA - NOT FROM DATABASE",
      "❌ Wrong price: $777,777",
      "❌ Wrong name",
      "❌ If you see this, database is NOT working",
      "❌ Check your .env file",
      "❌ Run SQL schema in Supabase",
      "❌ Verify Supabase credentials",
    ],
  },
];

export const regions = [
  { id: "dallas", name: "Dallas", health: "ok" },
  { id: "austin", name: "Austin", health: "ok" },
  { id: "houston", name: "Houston", health: "ok" },
  { id: "san-antonio", name: "San Antonio", health: "degraded" },
  { id: "fort-worth", name: "Fort Worth", health: "ok" },
];

export const towers = [
  { id: "eNB-001", region: "Dallas", health: "ok", lat: 32.7767, lng: -96.7970 },
  { id: "eNB-002", region: "Austin", health: "ok", lat: 30.2672, lng: -97.7431 },
  { id: "eNB-003", region: "Houston", health: "ok", lat: 29.7604, lng: -95.3698 },
  { id: "eNB-004", region: "San Antonio", health: "degraded", lat: 29.4241, lng: -98.4936 },
  { id: "eNB-005", region: "Fort Worth", health: "ok", lat: 32.7555, lng: -97.3308 },
  { id: "eNB-006", region: "El Paso", health: "ok", lat: 31.7619, lng: -106.4850 },
  { id: "eNB-007", region: "Arlington", health: "ok", lat: 32.7357, lng: -97.1081 },
  { id: "eNB-008", region: "Corpus Christi", health: "degraded", lat: 27.8006, lng: -97.3964 },
  { id: "eNB-009", region: "Plano", health: "ok", lat: 33.0198, lng: -96.6989 },
  { id: "eNB-010", region: "Lubbock", health: "ok", lat: 33.5779, lng: -101.8552 },
];

// Hardcoded device images mapping
export const deviceImages: Record<string, string> = {
  "iphone-16": "https://xjmzqlilkmbbpkjjpghu.supabase.co/storage/v1/object/public/device-pics/iphone16pro.jpeg",
  "iphone-15": "https://xjmzqlilkmbbpkjjpghu.supabase.co/storage/v1/object/public/device-pics/iphone15.jpeg",
  "pixel-9": "https://xjmzqlilkmbbpkjjpghu.supabase.co/storage/v1/object/public/device-pics/google-pixel9.webp",
  "galaxy-s25": "https://xjmzqlilkmbbpkjjpghu.supabase.co/storage/v1/object/public/device-pics/galazy-s25.jpeg",
  "oneplus-12": "https://xjmzqlilkmbbpkjjpghu.supabase.co/storage/v1/object/public/device-pics/oneplus-12.jpeg",
  "galaxy-a54": "https://xjmzqlilkmbbpkjjpghu.supabase.co/storage/v1/object/public/device-pics/samsung-galaxy-a54-5g-featured.png",
};

export const devices = [
  {
    id: "iphone-16",
    name: "🚨 MOCK DEVICE - NOT FROM DATABASE",
    os: "FAKE_OS",
    supports5G: false,
    supportsESIM: false,
    price: 999999,
    image: deviceImages["iphone-16"] || "/placeholder.svg",
  },
  {
    id: "pixel-9",
    name: "🚨 MOCK DEVICE - NOT FROM DATABASE",
    os: "FAKE_OS",
    supports5G: false,
    supportsESIM: false,
    price: 888888,
    image: deviceImages["pixel-9"] || "/placeholder.svg",
  },
  {
    id: "galaxy-s25",
    name: "🚨 MOCK DEVICE - NOT FROM DATABASE",
    os: "FAKE_OS",
    supports5G: false,
    supportsESIM: false,
    price: 777777,
    image: deviceImages["galaxy-s25"] || "/placeholder.svg",
  },
  {
    id: "iphone-15",
    name: "🚨 MOCK DEVICE - NOT FROM DATABASE",
    os: "FAKE_OS",
    supports5G: false,
    supportsESIM: false,
    price: 666666,
    image: deviceImages["iphone-15"] || "/placeholder.svg",
  },
  {
    id: "oneplus-12",
    name: "🚨 MOCK DEVICE - NOT FROM DATABASE",
    os: "FAKE_OS",
    supports5G: false,
    supportsESIM: false,
    price: 555555,
    image: deviceImages["oneplus-12"] || "/placeholder.svg",
  },
  {
    id: "galaxy-a54",
    name: "🚨 MOCK DEVICE - NOT FROM DATABASE",
    os: "FAKE_OS",
    supports5G: false,
    supportsESIM: false,
    price: 444444,
    image: deviceImages["galaxy-a54"] || "/placeholder.svg",
  },
];

export const incidents = [
  {
    id: "inc-001",
    date: "2025-11-07T14:30:00Z",
    region: "Seattle",
    tower: "eNB-789",
    issue: "Intermittent connectivity",
    resolved: true,
    eta: null,
  },
  {
    id: "inc-002",
    date: "2025-11-08T09:15:00Z",
    region: "Midtown ATL",
    tower: "eNB-123",
    issue: "Degraded service",
    resolved: false,
    eta: "35 minutes",
  },
];

export const faqs = [
  {
    question: "How do I check my data usage?",
    answer: "You can check your data usage in your account dashboard or through the AutoCare mobile app.",
  },
  {
    question: "What is 5G coverage like?",
    answer: "We have extensive 5G coverage in major metropolitan areas. Check our coverage map for details.",
  },
  {
    question: "Can I bring my own device?",
    answer: "Yes! Most unlocked devices are compatible with our network. Check our device compatibility tool.",
  },
  {
    question: "How do I enable Wi-Fi Calling?",
    answer: "Go to Settings > Cellular > Wi-Fi Calling and toggle it on. Make sure you're connected to Wi-Fi.",
  },
];

export const tickets = [
  {
    id: "INC-48291",
    summary: "Connectivity down after guided steps",
    status: "open",
    created: "2025-11-08T19:30:00Z",
    updated: "2025-11-08T19:45:00Z",
  },
  {
    id: "INC-48102",
    summary: "Cannot receive MMS messages",
    status: "in_progress",
    created: "2025-11-07T14:20:00Z",
    updated: "2025-11-08T10:15:00Z",
  },
  {
    id: "INC-47856",
    summary: "Slow data speeds in downtown",
    status: "resolved",
    created: "2025-11-06T08:45:00Z",
    updated: "2025-11-07T16:30:00Z",
  },
];
