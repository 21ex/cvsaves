import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Login: React.FC = () => {
  const nav = useNavigate();
  const { toast } = useToast();
  const [email, setE] = useState("");
  const [pass, setP] = useState("");
  const [loading, setL] = useState(false);

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
    <div className="min-h-screen grid place-items-center">
      <Toaster />
      <div className="w-full max-w-xs space-y-4">
        {/* BIG logo, but pull content upward so the overall layout feels like the default */}
        <Link to="/">
          <img
            src="/brand/CVSavesLongText.svg"
            alt="CVSaves by CVSolutions"
            className="mx-auto h-[320px] w-auto object-contain -mb-8 sm:-mb-10"
          />
        </Link>

        <div>
          <label>Email address</label>
          <Input
            value={email}
            onChange={(e) => setE(e.target.value)}
            type="email"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label>Password</label>
          <Input
            value={pass}
            onChange={(e) => setP(e.target.value)}
            type="password"
            placeholder="••••••••"
          />
          <Link to="/forgot-password" className="mt-1 inline-block text-xs text-foreground underline">
            Forgot password?
          </Link>
        </div>

        <Button className="w-full" onClick={go} disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Don’t have an account?{" "}
          <Link to="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
