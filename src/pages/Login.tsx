import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopNav } from "@/components/TopNav";
import LiquidEther from "@/components/LiquidEther";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Redirect based on role
      // Admin users will be redirected to /admin, regular users to /plans
      if (email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/plans');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // shared gradient classes
  const MAGENTA_GRADIENT =
    "bg-gradient-to-r from-[#5A0040] to-[#E20074] text-white border-0 shadow-lg hover:shadow-xl hover:brightness-110";

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

        {/* Login Form Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center py-20">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-md mx-auto">
              <Card className="rounded-2xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/10">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base mt-2">
                    Sign in to your T-Care account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-white font-medium">
                          Password
                        </Label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-white/80 hover:text-white transition-colors underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl backdrop-blur-sm"
                      />
                    </div>

                    {/* Sign In button with magenta gradient */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`
                        w-full py-6 text-base font-medium rounded-xl transition-all duration-300
                        ${MAGENTA_GRADIENT}
                      `}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>

                    <div className="text-center pt-4">
                      <p className="text-white/80">
                        Don't have an account?{" "}
                        <Link
                          to="/signup"
                          className="text-white font-medium hover:text-white/90 underline transition-colors"
                        >
                          Sign up
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
