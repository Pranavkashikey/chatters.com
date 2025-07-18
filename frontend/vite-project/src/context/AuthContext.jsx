import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem("chatapp");

      // Guard against undefined, null, or invalid JSON
      if (!raw || raw === "undefined" || raw === "null") {
        localStorage.removeItem("chatapp");
        return null;
      }

      return JSON.parse(raw);
    } catch (err) {
      console.error("Error parsing chatapp from localStorage:", err);
      localStorage.removeItem("chatapp");
      return null;
    }
  });

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, useAuth, AuthContextProvider };
