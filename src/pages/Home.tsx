import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopNav } from "@/components/TopNav";
import LiquidEther from "@/components/LiquidEther";

const Home = () => {
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

        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center py-20">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white tracking-tight drop-shadow-2xl">
                Connect to What Matters Most
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                Experience blazing-fast 5G coverage with unlimited plans designed for your lifestyle
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/plans">
                  <Button
                    size="lg"
                    className="
                      w-full sm:w-auto px-8 py-6 text-lg rounded-xl font-medium
                      transition-all duration-300 backdrop-blur-md
                      shadow-xl hover:shadow-2xl hover:scale-105
                      text-white
                      border-2 border-white/40
                      bg-white/10
                      hover:bg-gradient-to-r hover:from-[#5A0040] hover:to-[#E20074]
                      hover:border-transparent
                    "
                  >
                    View Plans
                  </Button>
                </Link>
                <Link to="/status">
                  <Button
                    size="lg"
                    className="
                      w-full sm:w-auto px-8 py-6 text-lg rounded-xl font-medium
                      transition-all duration-300 backdrop-blur-md
                      shadow-xl hover:shadow-2xl hover:scale-105
                      text-white
                      border-2 border-white/40
                      bg-white/10
                      hover:bg-gradient-to-r hover:from-[#5A0040] hover:to-[#E20074]
                      hover:border-transparent
                    "
                  >
                    Network Status
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="relative py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Why Choose Us
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
                Experience the difference with America's fastest 5G network
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="hover:shadow-2xl transition-all duration-300 rounded-2xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10 hover:bg-white/15 hover:scale-105">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-semibold text-white mb-3 drop-shadow-md">
                    Lightning Fast 5G
                  </CardTitle>
                  <CardDescription className="text-base text-white/90 leading-relaxed">
                    Experience ultra-fast speeds with our nationwide 5G network. Stream, download, and connect without limits.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/status">
                    <Button
                      variant="ghost"
                      className="group text-white hover:text-white hover:bg-white/20 p-0 h-auto font-medium backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
                    >
                      Network Status →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-2xl transition-all duration-300 rounded-2xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10 hover:bg-white/15 hover:scale-105">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-semibold text-white mb-3 drop-shadow-md">
                    Reliable Network
                  </CardTitle>
                  <CardDescription className="text-base text-white/90 leading-relaxed">
                    Stay connected with 99.9% uptime and 24/7 support. Your connection is our priority.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/status">
                    <Button
                      variant="ghost"
                      className="group text-white hover:text-white hover:bg-white/20 p-0 h-auto font-medium backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
                    >
                      Network Status →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-2xl transition-all duration-300 rounded-2xl border-white/20 shadow-xl backdrop-blur-xl bg-white/10 hover:bg-white/15 hover:scale-105">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-semibold text-white mb-3 drop-shadow-md">
                    Smart Support
                  </CardTitle>
                  <CardDescription className="text-base text-white/90 leading-relaxed">
                    Get instant help with our AI-powered support assistant. Available whenever you need us.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/help">
                    <Button
                      variant="ghost"
                      className="group text-white hover:text-white hover:bg-white/20 p-0 h-auto font-medium backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
                    >
                      Get Help →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto rounded-3xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10 p-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Ready to Switch?
              </h2>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto drop-shadow-md">
                Join millions of satisfied customers on America's fastest 5G network
              </p>
              <Link to="/plans">
                <Button
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-8 py-6 text-lg rounded-xl font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  See All Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
