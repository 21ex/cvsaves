import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Login: React.FC = () => {
  const nav = useNavigate();
  const { toast } = useToast();
  const [email, setE] = useState("");
  const [pass, setP] = useState("");
  const [loading, setL] = useState(false);
  const [resetting, setResetting] = useState(false);

  const go = async () => {
    setL(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setL(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      nav("/", { replace: true });
    }
  };

  const doReset = async () => {
    if (!email.trim()) {
      toast({
        title: "Enter your email",
        description: "We’ll send the reset link there.",
        variant: "destructive",
      });
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${location.origin}/login`,
    });
    setResetting(false);
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent a password reset link." });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center">
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
          <button
            type="button"
            className="mt-1 text-xs text-foreground underline"
            onClick={doReset}
            disabled={resetting}
          >
            {resetting ? "Sending..." : "Forgot password?"}
          </button>
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
