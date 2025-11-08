import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect to What Matters Most
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Experience blazing-fast 5G coverage with unlimited plans designed for your lifestyle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/plans">
                <Button size="lg" className="w-full sm:w-auto">
                  View Plans <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/coverage">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Check Coverage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Service Check */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Check Your Service</CardTitle>
              <CardDescription>Enter your ZIP code to see available coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input placeholder="Enter ZIP code" className="flex-1" />
                <Button>Check</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast 5G</CardTitle>
                <CardDescription>
                  Experience ultra-fast speeds with our nationwide 5G network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/coverage">
                  <Button variant="ghost" className="group">
                    View Coverage
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Reliable Network</CardTitle>
                <CardDescription>
                  Stay connected with 99.9% uptime and 24/7 support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/status">
                  <Button variant="ghost" className="group">
                    Network Status
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Support</CardTitle>
                <CardDescription>
                  Get instant help with our AI-powered support assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/help">
                  <Button variant="ghost" className="group">
                    Get Help
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Switch?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join millions of satisfied customers on America's fastest 5G network
          </p>
          <Link to="/plans">
            <Button size="lg" variant="secondary">
              See All Plans
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
