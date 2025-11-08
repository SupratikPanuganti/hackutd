import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin } from "lucide-react";
import { towers, regions } from "@/lib/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Coverage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1">
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Coverage Map</h1>
              <p className="text-xl text-muted-foreground">
                Check our network coverage in your area
              </p>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Search by ZIP Code</CardTitle>
                <CardDescription>Enter your ZIP code to see coverage details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Enter ZIP code" className="pl-9" />
                  </div>
                  <Button>Search</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-lg font-semibold">Interactive Coverage Map</p>
                      <p className="text-sm text-muted-foreground">Nationwide 5G coverage</p>
                    </div>
                  </div>
                  {/* Coverage Legend */}
                  <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary" />
                        <span className="text-sm">5G Ultra</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-success" />
                        <span className="text-sm">5G</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-warning" />
                        <span className="text-sm">4G LTE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tower Information */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle>Cell Tower Status</CardTitle>
                <CardDescription>Real-time status of towers in your region</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tower ID</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {towers.map((tower) => (
                      <TableRow key={tower.id}>
                        <TableCell className="font-mono">{tower.id}</TableCell>
                        <TableCell>{tower.region}</TableCell>
                        <TableCell>
                          <Badge variant={tower.health === "ok" ? "default" : "secondary"}>
                            {tower.health === "ok" ? "Operational" : "Degraded"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tower.lat.toFixed(4)}, {tower.lng.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Coverage;
