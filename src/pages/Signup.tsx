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
    const [password, setPassword] = useState("");
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);      // banner flag

    const disabled =
        !email.trim() || !password.trim() || !first.trim() || !last.trim();

    const handleSignup = async () => {
        if (disabled) return;

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { first_name: first.trim(), last_name: last.trim() },
                emailRedirectTo: `${location.origin}/login`,
            },
        });
        setLoading(false);

        if (error) {
            toast({
                title: "Sign-up failed",
                description: error.message,
                variant: "destructive",
            });
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
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-center text-3xl font-bold"> CVSaves • Signup</h1>

                {sent && (
                    <div className="rounded-md bg-green-100 dark:bg-green-900/40 p-3 text-center text-sm text-green-800 dark:text-green-200">
                        Almost done!&nbsp;Open the verification link we just e-mailed you.
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        placeholder="First name"
                        value={first}
                        onChange={e => setFirst(e.target.value)}
                        disabled={sent}
                    />
                    <Input
                        placeholder="Last name"
                        value={last}
                        onChange={e => setLast(e.target.value)}
                        disabled={sent}
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={sent}
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={sent}
                    />
                    <Button
                        className="w-full"
                        disabled={disabled || loading || sent}
                        onClick={handleSignup}
                    >
                        {loading ? "Signing up…" : "Sign Up"}
                    </Button>
                </div>

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
