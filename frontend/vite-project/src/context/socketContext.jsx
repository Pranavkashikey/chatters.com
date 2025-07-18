import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const { authUser } = useAuth();

  useEffect(() => {
    if (!authUser?._id) return;

    const newSocket = io("http://localhost:3000", {
      query: { userId: authUser._id },
    });

    // Save socket instance
    setSocket(newSocket);

    // Update online users when event received
    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUser(users);
    });

    // Clean up socket on unmount or logout
    return () => {
      newSocket.disconnect(); // Proper disconnection
      setSocket(null);
      setOnlineUser([]); // Reset online users
    };
  }, [authUser?._id]); // only reconnect when user ID changes

  return (
    <SocketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </SocketContext.Provider>
  );
};
