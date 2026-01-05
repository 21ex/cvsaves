import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Eye, EyeOff } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Enter the email on your account so we can send the reset link.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Reset link sent",
        description: "If that address exists, we sent a password reset link.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Toaster />
      <div className="w-full max-w-sm space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline">
          ← Back to home
        </Link>

        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the email you used to sign up. If it exists, we’ll send you a reset link.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email address</label>
          <div className="relative">
            <Input
              type={showEmail ? "text" : "email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowEmail((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
              aria-label={showEmail ? "Hide email" : "Show email"}
            >
              {showEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button className="w-full" onClick={submit} disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Remembered your password?{" "}
          <Link to="/login" className="underline">
            Go back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
