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

  const go = async () => {
    setL(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setL(false);
    if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
    else nav("/", { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-xs space-y-4">
        <h1 className="text-center text-3xl font-bold">CVSaves</h1>

        <div>
          <label>Email address</label>
          <Input value={email} onChange={e => setE(e.target.value)} type="email" placeholder="your@email.com" />
        </div>

        <div>
          <label>Password</label>
          <Input value={pass} onChange={e => setP(e.target.value)} type="password" placeholder="••••••••" />
        </div>

        <Button className="w-full" disabled={loading} onClick={go}>Sign&nbsp;in</Button>

        <p className="text-center text-sm">
          Don’t have an account?&nbsp;
          <Link to="/signup" className="underline">Sign&nbsp;up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
