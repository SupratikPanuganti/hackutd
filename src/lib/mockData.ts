// Mock data for the carrier website

export const plans = [
  {
    id: "basic",
    name: "Magenta Basic",
    price: 60,
    features: [
      "Unlimited talk, text & data",
      "5G included",
      "100GB premium data",
      "SD streaming",
      "Basic international",
    ],
  },
  {
    id: "plus",
    name: "Magenta Plus",
    price: 80,
    popular: true,
    features: [
      "Everything in Basic",
      "Unlimited premium data",
      "HD streaming",
      "20GB mobile hotspot",
      "Enhanced international",
      "Netflix Basic included",
    ],
  },
  {
    id: "max",
    name: "Magenta Max",
    price: 100,
    features: [
      "Everything in Plus",
      "40GB premium hotspot",
      "4K UHD streaming",
      "Premium international",
      "Netflix Standard included",
      "Apple TV+ included",
    ],
  },
];

export const regions = [
  { id: "atl", name: "Midtown ATL", health: "ok" },
  { id: "austin", name: "Austin", health: "ok" },
  { id: "seattle", name: "Seattle", health: "degraded" },
];

export const towers = [
  { id: "eNB-123", region: "Midtown ATL", health: "degraded", lat: 33.7756, lng: -84.3963 },
  { id: "eNB-456", region: "Austin", health: "ok", lat: 30.2672, lng: -97.7431 },
  { id: "eNB-789", region: "Seattle", health: "ok", lat: 47.6062, lng: -122.3321 },
];

export const devices = [
  {
    id: "iphone-16",
    name: "iPhone 16 Pro",
    os: "iOS",
    supports5G: true,
    supportsESIM: true,
    price: 999,
    image: "/placeholder.svg",
  },
  {
    id: "pixel-9",
    name: "Google Pixel 9",
    os: "Android",
    supports5G: true,
    supportsESIM: true,
    price: 799,
    image: "/placeholder.svg",
  },
  {
    id: "galaxy-s25",
    name: "Samsung Galaxy S25",
    os: "Android",
    supports5G: true,
    supportsESIM: true,
    price: 899,
    image: "/placeholder.svg",
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    os: "iOS",
    supports5G: true,
    supportsESIM: true,
    price: 699,
    image: "/placeholder.svg",
  },
  {
    id: "oneplus-12",
    name: "OnePlus 12",
    os: "Android",
    supports5G: true,
    supportsESIM: false,
    price: 699,
    image: "/placeholder.svg",
  },
  {
    id: "galaxy-a54",
    name: "Samsung Galaxy A54",
    os: "Android",
    supports5G: true,
    supportsESIM: false,
    price: 449,
    image: "/placeholder.svg",
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
