import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { AuthContextProvider } from "./context/AuthContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {SocketContextProvider} from "./context/socketContext.jsx"



createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="176771357410-dsm1rlefi7mkjff9r9j7get3ndjboq3h.apps.googleusercontent.com">
    <BrowserRouter>
      <AuthContextProvider>
        <SocketContextProvider>
           <App />
        </SocketContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
