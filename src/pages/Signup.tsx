/* src/pages/Signup.tsx – 2025-07-30
   • first & last name fields now mandatory
   • disables button until all fields are filled
   • passes names into Supabase user_metadata
*/

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Signup: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);

    const disabled =
        !email.trim() || !password.trim() || !firstName.trim() || !lastName.trim();

    const handleSignup = async () => {
        if (disabled) {
            toast({ title: "All fields are required" });
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { first_name: firstName.trim(), last_name: lastName.trim() },
                emailRedirectTo: `${location.origin}/login`,
            },
        });
        setLoading(false);

        if (error) {
            toast({ title: "Sign-up failed", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: "Check your e-mail",
                description:
                    "We sent a verification link. Please confirm your address before logging in.",
            });
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold text-center">Create an account</h1>

                <div className="space-y-4">
                    <Input
                        placeholder="First name"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                    />
                    <Input
                        placeholder="Last name"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                    />
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <Button className="w-full" disabled={disabled || loading} onClick={handleSignup}>
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
