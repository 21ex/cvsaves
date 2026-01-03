import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import "./index.css";        // ← your existing global styles
import "./styles/theme.css"; // ← NEW dark-mode overrides

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";        //client helper

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </SessionContextProvider>
  </React.StrictMode>,
);
