import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import "./Sidebar.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import userConversation from "../../Zustand/useConversation";
import "./MessageContainer.css";
import { useSocketContext } from "../../context/socketContext";

const SideBar = ({ onSelectUser }) => {
  const { authUser, setAuthUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});

  const {
    messages,
    setMessage,
    selectedConversation,
    setSelectedConversation,
  } = userConversation();

  const navigate = useNavigate();
  const { onlineUser, socket } = useSocketContext();

  const onlineUserIds = new Set(onlineUser); // Used for efficient lookup

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      setMessage((prevMessages) => [...prevMessages, newMessage]);
      setUnreadMessages((prev) => ({
        ...prev,
        [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
      }));
    });

    return () => socket?.off("newMessage");
  }, [socket, setMessage]);

  useEffect(() => {
    const fetchChatUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/user/currentchatters");
        const data = response.data;
        setChatUser(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(`/api/user/search?search=${searchInput}`);
      const data = response.data;
      setSearchUser(data.length ? data : []);
      if (!data.length) toast.info("User Not Found");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSelectedUserId(user._id);
    setUnreadMessages((prev) => ({ ...prev, [user._id]: 0 }));
  };

  const handleSearchBack = () => {
    setSearchUser([]);
    setSearchInput("");
  };

  const handleLogOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/logout");
      const data = response.data;

      if (data.success === false) {
        toast.error(data.message || "Failed to log out");
        return;
      }

      toast.success(data.message || "Logged out successfully");
      localStorage.removeItem("chatapp");
      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while logging out.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    navigate(`/profile/${authUser?._id}`);
  };

  return (
    <div className="sidebar-container">
      <div className="search-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="Search user"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="search-button" type="submit" disabled={loading}>
            <FaSearch />
          </button>
        </form>
        <img
          onClick={handleImageClick}
          src={
            authUser?.profilepic
              ? `http://localhost:3000/${authUser.profilepic}`
              : "default-profile-pic.png"
          }
          alt="Profile"
          className="profileimg"
        />
      </div>

      <div className="cond">
        {searchUser.length > 0 ? (
          <div className="search-results">
            {searchUser.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`otheruser ${selectedUserId === user._id ? "bg-sky-500" : ""}`}
              >
                <div className="Avatar">
                  <img
                    src={`http://localhost:3000/${user.profilepic}`}
                    alt="User"
                    className="img"
                  />
                  <p>{user.username}</p>
                  {onlineUserIds.has(user._id) && <span className="status-dot"></span>}
                </div>
              </div>
            ))}
            <div className="arrow">
              <button className="arrowbutton" onClick={handleSearchBack}>
                <IoArrowBackSharp />
              </button>
            </div>
          </div>
        ) : (
          <div className="chatuser">
            <div className="inchat">
              {chatUser.length === 0 ? (
                <div className="alone">
                  <h1>Why are you alone? 😊😊</h1>
                  <h1>Search username to chat !!</h1>
                </div>
              ) : (
                chatUser.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    className={`otheruser ${selectedUserId === user._id ? "bg-sky-500" : ""}`}
                  >
                    <div className="Avatar">
                      <img
                        src={`http://localhost:3000/${user.profilepic}`}
                        alt="User"
                        className="img"
                      />
                      <p>{user.username}</p>
                      {onlineUserIds.has(user._id) && <span className="status-dot"></span>}
                    </div>
                    {unreadMessages[user._id] > 0 && (
                      <div className="no-msg">{unreadMessages[user._id]}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        <div className="logout">
          <button className="logoutbutton" onClick={handleLogOut}>
            <BiLogOut />
          </button>
          <p>LogOut</p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
