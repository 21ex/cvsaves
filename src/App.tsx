import { Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useRoutes,
  useLocation,
} from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";

import Home from "./components/home";
import Login from "./pages/Login";
import routes from "tempo-routes";

function App() {
  const { session, isLoading } = useSessionContext();
  const { pathname } = useLocation();

  /* 1️⃣  wait for the cookie */
  if (isLoading) return null;

  /* 2️⃣  not signed-in → go to /login (unless we’re already there) */
  if (!session && pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  /* 3️⃣  signed-in and still on /login → send to dashboard */
  if (session && pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
