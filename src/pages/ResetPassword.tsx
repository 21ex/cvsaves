import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const ResetPassword: React.FC = () => {
  const { toast } = useToast();
  const nav = useNavigate();
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Apply session from URL hash (access_token/refresh_token for recovery)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    if (access_token && refresh_token && type === "recovery") {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) throw error;
          setReady(true);
        })
        .catch((err) => {
          toast({ title: "Invalid reset link", description: err.message, variant: "destructive" });
        });
    } else {
      toast({
        title: "Invalid or expired link",
        description: "Request a new password reset link.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const submit = async () => {
    if (!ready) return;
    if (!newPass || newPass.length < 8) {
      toast({
        title: "Password too short",
        description: "Please use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPass !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setLoading(false);
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now log in with your new password." });
      nav("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:underline">
          ← Back to login
        </Link>

        <h1 className="text-2xl font-semibold">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below. The link you used must be valid to continue.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium">New password</label>
          <Input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="New password"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm password</label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
          />
        </div>

        <Button className="w-full" onClick={submit} disabled={loading || !ready}>
          {loading ? "Updating…" : "Update password"}
        </Button>

        {!ready && (
          <p className="text-xs text-muted-foreground">
            Waiting for a valid reset link… If you reached this page directly, request a new reset link.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
