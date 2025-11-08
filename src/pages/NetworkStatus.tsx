import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { regions, incidents, towers } from "@/lib/mockData";
import { CheckCircle, AlertCircle, Bell } from "lucide-react";
import { MapboxMap } from "@/components/MapboxMap";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const NetworkStatus = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1">
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Network Status</h1>
              <p className="text-xl text-muted-foreground">
                Real-time updates on network performance and tower locations
              </p>
            </div>
          </div>
        </section>

        {/* Overall Status */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-success" />
                </div>
                <CardTitle className="text-2xl">All Systems Operational</CardTitle>
                <CardDescription>Network performance is within normal parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe to Status Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Map */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle>Cell Tower Map</CardTitle>
                <CardDescription>
                  Interactive map showing real-time tower locations and health status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <MapboxMap className="w-full h-[500px] rounded-b-2xl" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Regional Status */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Regional Status</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {regions.map((region) => (
                  <Card key={region.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{region.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={region.health === "ok" ? "default" : "secondary"}>
                        {region.health === "ok" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Operational
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Degraded
                          </>
                        )}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tower Details Table */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Tower Details</CardTitle>
                  <CardDescription>Detailed information about each cell tower</CardDescription>
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
          </div>
        </section>

        {/* Incident History */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                  <CardDescription>History of network incidents and resolutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>ETA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidents.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell className="text-sm">
                            {new Date(incident.date).toLocaleDateString()} {new Date(incident.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>{incident.region}</TableCell>
                          <TableCell>{incident.issue}</TableCell>
                          <TableCell>
                            <Badge variant={incident.resolved ? "default" : "secondary"}>
                              {incident.resolved ? "Resolved" : "In Progress"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {incident.eta || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NetworkStatus;
