import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { devices } from "@/lib/mockData";
import { Smartphone, Wifi, Signal } from "lucide-react";

const Devices = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1">
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Devices</h1>
              <p className="text-xl text-muted-foreground">
                Choose from the latest smartphones, all 5G ready
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm">All Devices</Button>
              <Button variant="outline" size="sm">iOS</Button>
              <Button variant="outline" size="sm">Android</Button>
              <Button variant="outline" size="sm">5G</Button>
              <Button variant="outline" size="sm">eSIM</Button>
            </div>
          </div>
        </section>

        {/* Device Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {devices.map((device) => (
                <Card key={device.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-xl mb-4 flex items-center justify-center">
                      <Smartphone className="h-24 w-24 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl">{device.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground mt-2">
                      ${device.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{device.os}</Badge>
                      {device.supports5G && (
                        <Badge variant="outline">
                          <Signal className="h-3 w-3 mr-1" />
                          5G
                        </Badge>
                      )}
                      {device.supportsESIM && (
                        <Badge variant="outline">
                          <Wifi className="h-3 w-3 mr-1" />
                          eSIM
                        </Badge>
                      )}
                    </div>
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Knowledge Base Info */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Need Help Setting Up?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Check out our device setup guides for step-by-step instructions on configuring Wi-Fi Calling, APN settings, and more.
              </p>
              <Button size="lg">View Setup Guides</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Devices;
