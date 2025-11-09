import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDevices } from "@/lib/supabaseService";
import { Device } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import LiquidEther from "@/components/LiquidEther";

type FilterType = "all" | "iOS" | "Android" | "5G" | "eSIM";

/* Customer-relevant bullets (positive tone) */
const deviceKeyFeatures: Record<string, string[]> = {
  "Samsung Galaxy A54": [
    '6.4" AMOLED 120 Hz — smooth & bright',
    "50 MP main camera with OIS",
    "5,000 mAh battery for all-day use",
    "Expandable storage (microSD)",
    "5G + IP67 water resistance",
  ],
  "iPhone 15": [
    '6.1" Super Retina OLED with Dynamic Island',
    "48 MP main camera + great 4K video",
    "A16 Bionic — fast for years",
    "USB-C + MagSafe wireless charging",
    "5G + long iOS support",
  ],
  "OnePlus 12": [
    '6.82" 120 Hz AMOLED — ultra bright',
    "Snapdragon 8 Gen 3 flagship power",
    "5,400 mAh + super-fast charging",
    "Triple camera with 3× optical zoom",
    "5G + Wi-Fi 7 + in-display fingerprint",
  ],
  "Google Pixel 9": [
    '6.3" 120 Hz OLED display',
    "Tensor G4 with on-device AI",
    "Pixel photo quality with Night Sight",
    "Face + fingerprint unlock",
    "7 years OS & security updates",
  ],
  "Samsung Galaxy S25": [
    '6.2" AMOLED 120 Hz display',
    "Next-gen flagship chipset",
    "Pro triple camera with 3× optical zoom",
    "Galaxy AI features built in",
    "5G + Wi-Fi 7 + IP68 durability",
  ],
  "iPhone 16 Pro": [
    '6.3" ProMotion 120 Hz OLED',
    "A18 Pro — industry-leading performance",
    "48 MP main + 5× telephoto zoom",
    "Titanium build + Capture Button",
    "USB-C, MagSafe, 5G",
  ],
};

/* Fallback bullets if device name isn't mapped */
function buildFallbackFeatures(device: Device): string[] {
  const ios = device.os?.toLowerCase().includes("ios") ?? false;
  const base: string[] = ios
    ? [
      "Beautiful OLED display",
      "Fantastic photos & 4K video",
      "Fast performance that lasts years",
      "MagSafe + USB-C charging",
      "5G connectivity",
    ]
    : [
      "Vivid 120 Hz display",
      "Sharp photos with night mode",
      "All-day battery life",
      "Fast charging over USB-C",
      "5G connectivity",
    ];
  if (!device.supports_5g) return base.filter((b) => !b.includes("5G"));
  return base;
}

const Devices = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [hoveringFilter, setHoveringFilter] = useState<FilterType | null>(null); // for "active loses color on other hover"
  const [expandedId, setExpandedId] = useState<string | null>(null); // which card shows the overlay

  // Shared magenta styles
  const MAGENTA_GRADIENT =
    "bg-gradient-to-r from-[#5A0040] to-[#E20074] text-white border-0 shadow-lg hover:shadow-xl";
  const MAGENTA_HOVER =
    "hover:bg-gradient-to-r hover:from-[#5A0040] hover:to-[#E20074] hover:text-white hover:border-transparent";

  const filters = useMemo(() => {
    switch (activeFilter) {
      case "iOS":
        return { os: "iOS" };
      case "Android":
        return { os: "Android" };
      case "5G":
        return { supports_5g: true };
      case "eSIM":
        return { supports_esim: true };
      default:
        return {};
    }
  }, [activeFilter]);

  const { data, isLoading, isError, error, isFetching } = useQuery<Device[]>({
    queryKey: ["devices", filters],
    queryFn: () => getDevices(filters),
    placeholderData: (previousData) => previousData,
  });

  const devices: Device[] = useMemo(() => data ?? [], [data]);
  const isMockData = useMemo(
    () => devices.length > 0 && devices.every((device) => device._fromDatabase === false),
    [devices]
  );

  const FilterBtn = ({ label, value }: { label: string; value: FilterType }) => {
    const isActive = activeFilter === value;
    const showActiveGradient = isActive && (!hoveringFilter || hoveringFilter === value);

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setActiveFilter(value)}
        onMouseEnter={() => setHoveringFilter(value)}
        onMouseLeave={() => setHoveringFilter(null)}
        className={cn(
          "rounded-xl px-4 py-2 transition-all duration-200 backdrop-blur-sm",
          showActiveGradient
            ? cn(MAGENTA_GRADIENT, "hover:brightness-110")
            : cn("text-white border border-white/20 bg-white/10", MAGENTA_HOVER, "hover:brightness-110")
        )}
      >
        {label}
      </Button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Full Page Three.js Background */}
      <div className="fixed inset-0 z-0 bg-black">
        <LiquidEther
          colors={["#000000", "#5A0040", "#E20074"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-[#5A0040]/20 via-transparent to-[#E20074]/30 pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        <TopNav />

        <main className="flex-1 relative">
          {/* Filters */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <FilterBtn label="All Devices" value="all" />
                <FilterBtn label="iOS" value="iOS" />
                <FilterBtn label="Android" value="Android" />
                <FilterBtn label="5G" value="5G" />
                <FilterBtn label="eSIM" value="eSIM" />
              </div>
              {isMockData && (
                <div className="mt-6 mx-auto max-w-2xl">
                  <Card className="border-yellow-400/30 bg-yellow-500/10 text-white">
                    <CardContent className="py-4">
                      <p className="text-sm">
                        Unable to reach Supabase. Showing mock devices instead. Verify your Supabase credentials to see
                        live inventory.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </section>

          {/* Device Grid */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              {(isLoading || isFetching) && (
                <div className="flex justify-center mb-8">
                  <Card className="border-white/20 bg-white/5 text-white backdrop-blur-md px-6 py-4">
                    <span>{isLoading ? "Loading devices…" : "Updating devices…"}</span>
                  </Card>
                </div>
              )}

              {isError && (
                <div className="flex justify-center mb-8">
                  <Card className="border-red-400/40 bg-red-500/10 text-white backdrop-blur-md px-6 py-4">
                    <span>Failed to load devices: {(error as Error).message}</span>
                  </Card>
                </div>
              )}

              {!isLoading && !isError && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {devices.map((device) => {
                    const price = device.price !== null ? `$${device.price}` : "Contact sales";
                    const deviceImage = device.devices_pics_url || device.image_url || "/placeholder.svg";
                    const isExpanded = expandedId === device.id;
                    const features = deviceKeyFeatures[device.name] ?? buildFallbackFeatures(device);

                    return (
                      <Card
                        key={device.id}
                        className="hover:shadow-2xl transition-all duration-300 rounded-2xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10 hover:bg-white/15 hover:scale-105"
                      >
                        <CardHeader>
                          {/* Static image + FLIP-IN overlay (only overlay rotates) */}
                          <div className="[perspective:1200px]">
                            <div className="relative aspect-square rounded-2xl mb-4 border border-white/20 overflow-hidden">
                              {/* IMAGE stays static */}
                              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-0">
                                <img
                                  src={deviceImage}
                                  alt={device.name}
                                  className="object-contain w-full h-full p-6"
                                  loading="lazy"
                                />
                              </div>

                              {/* OVERLAY — white info card flips in over the image */}
                              <div
                                className={cn(
                                  "absolute inset-0 rounded-2xl bg-white p-6 flex flex-col shadow-2xl z-10",
                                  "[transform-style:preserve-3d] [backface-visibility:hidden]",
                                  "origin-bottom transition-transform duration-500 ease-out",
                                  isExpanded ? "[transform:rotateX(0deg)]" : "[transform:rotateX(90deg)]",
                                  !isExpanded && "pointer-events-none"
                                )}
                                aria-hidden={!isExpanded}
                              >
                                <h4 className="text-zinc-900 font-semibold mb-2">Key features</h4>
                                <ul
                                  className={cn(
                                    "text-sm text-zinc-800 space-y-2 overflow-auto",
                                    "transition-opacity duration-300",
                                    isExpanded ? "opacity-100 delay-150" : "opacity-0"
                                  )}
                                >
                                  {features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0" />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <CardTitle className="text-xl text-white drop-shadow-md flex items-center gap-2">
                            {device.name}
                            {device._fromDatabase && (
                              <Badge
                                variant="outline"
                                className="bg-green-500/20 border-green-500/40 text-green-100"
                              >
                                Live
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-2xl font-bold text-white mt-2 drop-shadow-md">
                            {price}
                          </CardDescription>
                        </CardHeader>

                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge
                              variant="secondary"
                              className="rounded-lg bg-white/20 text-white border-white/20 backdrop-blur-sm"
                            >
                              {device.os}
                            </Badge>
                            {device.supports_5g && (
                              <Badge
                                variant="outline"
                                className="rounded-lg bg-white/10 text-white border-white/20 backdrop-blur-sm"
                              >
                                5G
                              </Badge>
                            )}
                            {device.supports_esim && (
                              <Badge
                                variant="outline"
                                className="rounded-lg bg-white/10 text-white border-white/20 backdrop-blur-sm"
                              >
                                eSIM
                              </Badge>
                            )}
                          </div>

                          {/* Toggle overlay flip */}
                          <Button
                            className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm"
                            variant="outline"
                            onClick={() => setExpandedId((cur) => (cur === device.id ? null : device.id))}
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Knowledge Base Info */}
          {/* Catalog CTA / Quick Filters */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <Card className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 p-8">
                  <h2 className="text-3xl font-bold mb-3 text-white drop-shadow-lg">
                    Explore the Full Device Catalog
                  </h2>
                  <p className="text-lg text-white/90 mb-8 drop-shadow-md">
                    Jump to what you want by platform or feature.
                  </p>



                  {/* Primary CTA */}
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-[#5A0040] to-[#E20074] text-white border-0 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 px-8"
                  // onClick={() => { /* optional: open compare, scroll, etc. */ }}
                  >
                    Browse All Devices
                  </Button>

                  {/* Optional secondary links (dead ok) */}
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/15 border border-white/20 rounded-xl"
                    >
                      Compare Phones →
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/15 border border-white/20 rounded-xl"
                    >
                      Deals & Trade-In →
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/15 border border-white/20 rounded-xl"
                    >
                      Accessories →
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default Devices;
