/* src/pages/Signup.tsx – 2025-07-30
   • first / last name required
   • password length toast
   • terms checkbox + dialog; must be checked to enable sign-up
*/

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

/* shadcn/ui dialog for Terms */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const MIN_PASS = 8;

const Signup: React.FC = () => {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (!email || !email2 || !pass || !pass2 || !first || !last) {
      toast({
        title: "Missing info",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (email !== email2) {
      toast({
        title: "Emails do not match",
        description: "Please enter the same email twice.",
        variant: "destructive",
      });
      return;
    }

    if (pass.length < MIN_PASS) {

      console.log ("mathew")
      toast({
        title: "Password too short",
        description: `Please use at least ${MIN_PASS} characters.`,
        variant: "destructive",
      });
      return;
    }

    if (pass !== pass2) {
      toast({
        title: "Passwords do not match",
        description: "Please enter the same password twice.",
        variant: "destructive",
      });
      return;
    }

    if (!agree) {
      toast({
        title: "Agree to Terms",
        description: "Please read and accept the Terms & Conditions to continue.",
        variant: "destructive",
      });
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
      toast({
        title: "Sign-up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created",
        description: "You can now log in.",
      });
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-background px-4 py-10 md:py-12 md:items-center">
      {/* Mount a toaster here so toasts always render on this page */}
      <Toaster />

      <div className="w-full max-w-sm md:max-w-md space-y-3">
        {/* Logo + title. Pointer-events disabled so it never blocks inputs */}
        <h1 className="m-0 -mb-8 md:-mb-12 text-center text-3xl font-bold flex items-center justify-center gap-2 -translate-x-[14px] translate-y-[6px] pointer-events-none select-none">
          <img
            src="/brand/CVSavesBlack.svg"
            alt="CVSaves"
            className="h-52 md:h-[255px] w-auto object-contain"
          />
          <span className="relative inline-block -translate-x-4 top-[2px]">•</span>
          <span>Signup</span>
        </h1>

        {sent && (
          <div className="rounded-md bg-green-100 dark:bg-green-900/40 p-3 text-center text-sm text-green-800 dark:text-green-200">
            Account created! You can now log in.
          </div>
        )}

        <div className="space-y-4">
          <Input
            placeholder="First name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            disabled={sent}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          />
          <Input
            placeholder="Last name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            disabled={sent}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sent}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          />
          <Input
            placeholder="Confirm email"
            type="email"
            value={email2}
            onChange={(e) => setEmail2(e.target.value)}
            disabled={sent}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          />
          <div className="relative">
            <Input
              placeholder="Password"
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              disabled={sent}
              className="pr-10 h-11 rounded-md border border-input bg-background px-3 text-sm"
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
          <div className="relative">
            <Input
              placeholder="Confirm password"
              type={showPass2 ? "text" : "password"}
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              disabled={sent}
              className="pr-10 h-11 rounded-md border border-input bg-background px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass2((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
              aria-label={showPass2 ? "Hide password" : "Show password"}
            >
              {showPass2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Terms checkbox + inline link to open dialog */}
        <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="h-4 w-4 accent-foreground"
            disabled={sent}
          />
          <span>
            I agree to the{" "}
            <button
              type="button"
              className="underline text-foreground"
              onClick={() => setShowTerms(true)}
            >
              Terms &amp; Conditions
            </button>
            .
          </span>
        </label>

        <Button className="w-full" disabled={sent || loading} onClick={go}>
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm">
          Already have an account?&nbsp;
          <Link className="underline" to="/login">
            Log in
          </Link>
        </p>
      </div>

      {/* Terms dialog */}
     <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Terms &amp; Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground max-h-[60vh] overflow-y-auto pr-2">
            {/* Replace this copy with your real T&C */}
            <p>
              Welcome to CVSaves! By creating an account, you agree to comply with and be bound by the
              following terms. Please read them carefully.
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <span className="text-foreground font-medium">Use of Service.</span> You will use the app
                lawfully and only for personal budgeting purposes.
              </li>
              <li>
                <span className="text-foreground font-medium">Data.</span> You own your data. We store only
                what is necessary to operate the service. Review our Privacy Policy for details.
              </li>
              <li>
                <span className="text-foreground font-medium">Security.</span> Keep your credentials secure.
                You are responsible for activity on your account.
              </li>
              <li>
                <span className="text-foreground font-medium">Availability.</span> Service is provided “as
                is”, without warranties; outages or changes may occur.
              </li>
              <li>
                <span className="text-foreground font-medium">Termination.</span> We may suspend or terminate
                accounts that violate these terms.
              </li>
              <li>
                <span className="text-foreground font-medium">Updates.</span> We may update these terms and
                will post the effective date with changes.
              </li>
            </ol>
            <p className="text-xs">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowTerms(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setAgree(true);
                setShowTerms(false);
              }}
            >
              I Agree
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
