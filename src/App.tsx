import { Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";

/* pages / components */
import Home from "@/components/home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

/* -------------------------------------------------------------------------- */

const App = () => (
  /* BrowserRouter is already provided in main.tsx, so only SessionProvider here */
  <SessionContextProvider supabaseClient={supabase}>
    <Routes>
      <Route path="/" element={<Guard><Home /></Guard>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* fallback → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </SessionContextProvider>
);

export default App;

/* ---------- tiny auth-guard ---------- */
const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useSessionContext();

  // Avoid redirecting while Supabase is restoring the session
  if (isLoading) return null;

  return session ? <>{children}</> : <Navigate to="/login" replace />;
};


