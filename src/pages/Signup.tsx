/* src/pages/Signup.tsx – 2025-07-30
   • first / last name required
   • after sign-up shows toast + inline banner (remains after route change)
*/

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Signup: React.FC = () => {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (!email || !pass || !first || !last) {
      toast({ title: "Missing info", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { first_name: first, last_name: last },
        emailRedirectTo: `${location.origin}/login`,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Check your e-mail",
        description: "We sent a verification link – confirm your address to finish.",
      });
      setSent(true);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-3">
        {/* Logo + title. Nudged left and slightly down for optical centering */}
        <h1 className="m-0 -mb-8 md:-mb-12 text-center text-3xl font-bold flex items-center justify-center gap-2 -translate-x-[14px] translate-y-[6px]">
          <img
            src="/brand/CVSavesBlack.svg"
            alt="CVSaves"
            className="h-[255px] w-auto object-contain"
          />
          <span className="relative inline-block -translate-x-4 top-[2px]">•</span>
          <span>Signup</span>
        </h1>

        {sent && (
          <div className="rounded-md bg-green-100 dark:bg-green-900/40 p-3 text-center text-sm text-green-800 dark:text-green-200">
            Almost done!&nbsp;Open the verification link we just e-mailed you.
          </div>
        )}

        <div className="space-y-4">
          <Input
            placeholder="First name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            disabled={sent}
          />
          <Input
            placeholder="Last name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            disabled={sent}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sent}
          />
          <Input
            placeholder="Password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            disabled={sent}
          />
        </div>

        <Button className="w-full" disabled={sent || loading} onClick={go}>
          Sign Up
        </Button>

        <p className="text-center text-sm">
          Already have an account?&nbsp;
          <Link className="underline" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
