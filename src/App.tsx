import { Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";

/* pages / components */
import Home from "@/components/home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

/* -------------------------------------------------------------------------- */

const App = () => (
  /* BrowserRouter is already provided in main.tsx, so only SessionProvider here */
  <SessionContextProvider supabaseClient={supabase}>
    <Routes>
      <Route path="/" element={<Guard><Home /></Guard>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* fallback → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </SessionContextProvider>
);

export default App;

/* ---------- tiny auth-guard ---------- */
const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useSessionContext();
  return session ? <>{children}</> : <Navigate to="/login" replace />;
};
