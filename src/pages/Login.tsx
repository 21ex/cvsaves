import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";

export default function Login() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}                 // ← keep empty for e-mail only
        redirectTo={`${window.location.origin}/`}
        view="sign_in"                 // (optional) forces e-mail + password
      />
    </div>
  );
}
