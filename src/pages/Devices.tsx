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

const Devices = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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

  const devices: Device[] = data ?? [];
  const isMockData = useMemo(
    () => devices.length > 0 && devices.every((device) => device._fromDatabase === false),
    [devices],
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Full Page Three.js Background */}
      <div className="fixed inset-0 z-0 bg-black">
        <LiquidEther
          colors={['#000000', '#5A0040', '#E20074']}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter("all")}
                className={cn(
                  "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm rounded-xl",
                  activeFilter === "all" && "bg-white/30 border-white/40"
                )}
              >
                All Devices
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter("iOS")}
                className={cn(
                  "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm rounded-xl",
                  activeFilter === "iOS" && "bg-white/30 border-white/40"
                )}
              >
                iOS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter("Android")}
                className={cn(
                  "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm rounded-xl",
                  activeFilter === "Android" && "bg-white/30 border-white/40"
                )}
              >
                Android
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter("5G")}
                className={cn(
                  "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm rounded-xl",
                  activeFilter === "5G" && "bg-white/30 border-white/40"
                )}
              >
                5G
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter("eSIM")}
                className={cn(
                  "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm rounded-xl",
                  activeFilter === "eSIM" && "bg-white/30 border-white/40"
                )}
              >
                eSIM
              </Button>
            </div>
            {isMockData && (
              <div className="mt-6 mx-auto max-w-2xl">
                <Card className="border-yellow-400/30 bg-yellow-500/10 text-white">
                  <CardContent className="py-4">
                    <p className="text-sm">
                      Unable to reach Supabase. Showing mock devices instead. Verify your Supabase credentials to see live inventory.
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

                  return (
                    <Card key={device.id} className="hover:shadow-2xl transition-all duration-300 rounded-2xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10 hover:bg-white/15 hover:scale-105">
                      <CardHeader>
                        <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl mb-4 flex items-center justify-center border border-white/20 overflow-hidden relative">
                          <img 
                            src={deviceImage} 
                            alt={device.name} 
                            className="object-contain w-full h-full p-6"
                            loading="lazy" 
                          />
                        </div>
                        <CardTitle className="text-xl text-white drop-shadow-md flex items-center gap-2">
                          {device.name}
                          {device._fromDatabase && (
                            <Badge variant="outline" className="bg-green-500/20 border-green-500/40 text-green-100">
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
                          <Badge variant="secondary" className="rounded-lg bg-white/20 text-white border-white/20 backdrop-blur-sm">{device.os}</Badge>
                          {device.supports_5g && (
                            <Badge variant="outline" className="rounded-lg bg-white/10 text-white border-white/20 backdrop-blur-sm">
                              5G
                            </Badge>
                          )}
                          {device.supports_esim && (
                            <Badge variant="outline" className="rounded-lg bg-white/10 text-white border-white/20 backdrop-blur-sm">
                              eSIM
                            </Badge>
                          )}
                        </div>
                        <Button className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm" variant="outline">
                          View Details
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
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Card className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 p-8">
                <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">Need Help Setting Up?</h2>
                <p className="text-lg text-white/90 mb-6 drop-shadow-md">
                  Check out our device setup guides for step-by-step instructions on configuring Wi-Fi Calling, APN settings, and more.
                </p>
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl">View Setup Guides</Button>
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
