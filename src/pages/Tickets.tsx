import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tickets } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Tickets = () => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "secondary";
      case "in_progress":
        return "default";
      case "resolved":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      <main className="flex-1">
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">My Support Tickets</h1>
              <p className="text-xl text-muted-foreground">
                Track your support requests and resolutions
              </p>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Your recent support interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono">{ticket.id}</TableCell>
                        <TableCell>{ticket.summary}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(ticket.status)}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ticket.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ticket.updated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Link to={`/ticket/${ticket.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
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

export default Tickets;
