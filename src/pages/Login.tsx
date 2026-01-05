import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Login: React.FC = () => {
  const nav = useNavigate();
  const { toast } = useToast();
  const [email, setE] = useState("");
  const [pass, setP] = useState("");
  const [loading, setL] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const goHome = () => nav("/", { replace: true });

  const go = async () => {
    setL(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setL(false);
    if (error) {
      const friendly =
        error.message?.toLowerCase().includes("invalid login credentials") ||
        error.message?.toLowerCase().includes("invalid email or password")
          ? "The email or password is incorrect. Please try again."
          : error.message;
      toast({ title: "Login failed", description: friendly, variant: "destructive" });
    } else {
      nav("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <Toaster />
      <div className="w-full max-w-xs space-y-5">
        <button
          type="button"
          onClick={goHome}
          className="block text-center mx-auto focus:outline-none"
          aria-label="CVSaves Home"
        >
          <img
            src="/brand/CVSavesLongText.svg"
            alt="CVSaves by CVSolutions"
            className="mx-auto h-72 w-auto object-contain md:h-[320px] md:-mb-6"
          />
        </button>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email address</label>
          <Input
            value={email}
            onChange={(e) => setE(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <Input
              value={pass}
              onChange={(e) => setP(e.target.value)}
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              className="h-11 rounded-md border border-input bg-background px-3 pr-10 text-sm"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Link to="/forgot-password" className="mt-1 inline-block text-xs text-muted-foreground underline">
            Forgot password?
          </Link>
        </div>

        <Button className="w-full h-11 text-sm font-semibold mt-2" onClick={go} disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>

        <p className="text-sm text-center text-muted-foreground mt-1">
          Don't have an account?{" "}
          <Link to="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
