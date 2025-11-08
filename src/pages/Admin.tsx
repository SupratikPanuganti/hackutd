import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { regions, tickets } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const Admin = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1">
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin Dashboard</h1>
              <p className="text-xl text-muted-foreground">
                Monitor network health and support operations
              </p>
            </div>
          </div>
        </section>

        {/* Regional Overview */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Regional Overview</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {regions.map((region) => (
                <Card key={region.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{region.name}</CardTitle>
                      <Badge variant={region.health === "ok" ? "default" : "secondary"}>
                        {region.health === "ok" ? "Healthy" : "Degraded"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Happiness Score</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">
                          {region.health === "ok" ? "72%" : "46%"}
                        </span>
                        {region.health === "ok" ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Open Tickets</span>
                      <span className="font-semibold">
                        {region.health === "ok" ? "3" : "12"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Outages</span>
                      <span className="font-semibold">
                        {region.health === "ok" ? "0" : "1"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Tickets */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Support Tickets</CardTitle>
                    <CardDescription>Latest customer support interactions</CardDescription>
                  </div>
                  <Link to="/admin/tickets">
                    <Button variant="outline">View All Tickets</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm">{ticket.id}</span>
                          <Badge variant={ticket.status === "resolved" ? "outline" : "secondary"}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ticket.summary}</p>
                      </div>
                      <Link to={`/ticket/${ticket.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* System Alerts */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card className="border-warning">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <CardTitle>System Alerts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Degraded service in Seattle region</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>High ticket volume in Midtown ATL</span>
                    <Badge variant="outline">Monitoring</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
