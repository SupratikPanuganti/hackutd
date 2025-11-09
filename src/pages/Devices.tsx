import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { devices } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type FilterType = "all" | "iOS" | "Android" | "5G" | "eSIM";

const Devices = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredDevices = devices.filter((device) => {
    switch (activeFilter) {
      case "iOS":
        return device.os === "iOS";
      case "Android":
        return device.os === "Android";
      case "5G":
        return device.supports5G;
      case "eSIM":
        return device.supportsESIM;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#5A0040]">
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
          </div>
        </section>

        {/* Device Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredDevices.map((device) => (
                <Card key={device.id} className="hover:shadow-2xl transition-all duration-300 rounded-2xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10 hover:bg-white/15 hover:scale-105">
                  <CardHeader>
                    <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl mb-4 flex items-center justify-center border border-white/20">
                      <span className="text-6xl">📱</span>
                    </div>
                    <CardTitle className="text-xl text-white drop-shadow-md">{device.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-white mt-2 drop-shadow-md">
                      ${device.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="rounded-lg bg-white/20 text-white border-white/20 backdrop-blur-sm">{device.os}</Badge>
                      {device.supports5G && (
                        <Badge variant="outline" className="rounded-lg bg-white/10 text-white border-white/20 backdrop-blur-sm">
                          5G
                        </Badge>
                      )}
                      {device.supportsESIM && (
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
              ))}
            </div>
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
  );
};

export default Devices;
