import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const Signup: React.FC = () => {
    const { toast } = useToast();

    /* form state */
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [fn, setFn] = useState("");
    const [ln, setLn] = useState("");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);      // show success message once

    const doSignup = async () => {
        setBusy(true);
        const { error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: { first_name: fn.trim(), last_name: ln.trim() },
                emailRedirectTo: `${location.origin}/login`
            }
        });
        setBusy(false);

        if (error) {
            toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: "Almost there!",
                description: "We’ve sent a verification link to your e-mail.",
                duration: 6000
            });
            setDone(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Toaster />   {/* local toaster – lives only on this page */}

            <div className="space-y-4 w-80">
                <h1 className="text-2xl font-bold text-center mb-6">CVSaves • Sign&nbsp;Up</h1>

                <Input placeholder="First name" disabled={busy || done} value={fn}
                    onChange={e => setFn(e.target.value)} />
                <Input placeholder="Last name" disabled={busy || done} value={ln}
                    onChange={e => setLn(e.target.value)} />
                <Input placeholder="Your email address" type="email"
                    disabled={busy || done} value={email}
                    onChange={e => setEmail(e.target.value)} />
                <Input placeholder="Your password" type="password"
                    disabled={busy || done} value={pass}
                    onChange={e => setPass(e.target.value)} />

                {!done ? (
                    <Button className="w-full" disabled={busy} onClick={doSignup}>
                        {busy ? "Creating…" : "Sign Up"}
                    </Button>
                ) : (
                    <p className="text-center text-green-600 font-medium">
                        Verification e-mail sent ✔
                    </p>
                )}

                <p className="text-center text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
