import React, { useEffect, useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import "./MessageContainer.css";
import userConversation from "../../Zustand/useConversation";
import { TiMessages } from "react-icons/ti";
import { useAuth } from "../../context/AuthContext";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import axios from "axios";
import { useSocketContext } from "../../context/socketContext";
import notify from "../../assets/sound/notification-2-269292.mp3";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const parseMessageWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="auto-link"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};


const MessageContainer = ({ onBackUser }) => {
  const {
    messages,
    selectedConversation,
    setMessage,
    setSelectedConversation,
  } = userConversation();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSendData] = useState("");
  const { socket } = useSocketContext();
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const navigate=useNavigate();

  const lastMessageRef = useRef();

  useEffect(() => {
    socket?.on("typing", ({ senderId }) => {
      if (senderId === selectedConversation?._id) {
        setIsTyping(true);
        // Auto-clear after 2 seconds of no typing
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket?.off("typing");
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      const sound = new Audio(notify);
      sound.play().catch(console.error);
      setMessage([...messages, newMessage]);
    });
    return () => socket?.off("newMessage");
  }, [socket, setMessage, messages]);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  console.log(authUser._id);
  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const get = await axios.get(
          `/api/message/${selectedConversation?._id}`
        );
        const data = await get.data;
        if (data.success === false) {
          setLoading(false);
          console.log(data.message);
        }
        setLoading(false);
        setMessage(data);

        //  Mark all messages from this user as seen
        await axios.put(`/api/message/seen/${selectedConversation._id}`, {
          receiverId: authUser._id,
        });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessage, sendData]);

  useEffect(() => {
    const markSeen = async () => {
      try {
        if (selectedConversation?._id) {
          await axios.put(`/api/message/seen/${selectedConversation._id}`);
        }
      } catch (error) {
        console.error("Failed to mark messages as seen:", error);
      }
    };

    markSeen();
  }, [selectedConversation]);

  const handleMessage = (e) => {
    setSendData(e.target.value);
    socket?.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedConversation._id,
    });
  };

    const handleReport = async (userId) => {
    const reason = prompt("Enter report reason:");
    if (!reason) return;

    try {
await axios.post("http://localhost:3000/api/re/rep", {
  reportedUser: userId,
  reportedBy: authUser._id,
  reason,
}, { withCredentials: true });


      toast.success("Reported successfully");
    } catch (error) {
      console.error("Error reporting user:", error);
      toast.error("Failed to report user");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedConversation || !selectedConversation._id) {
    console.error("No conversation selected.");
    return;
  }

  setSending(true);
  try {
    const res = await axios.post(
      `/api/message/send/${selectedConversation._id}`,
      {
        message: sendData,
        receiverId: selectedConversation._id,
      }
    );

    const data = res.data;

    if (!data.success) {
      toast.error(data.message || "Failed to send message.");
      return;
    }

    setSendData("");
  } catch (error) {
    if (error.response?.status === 403) {
      toast.error(error.response.data.message || "You are blocked from sending messages.");
    } else {
      console.error("Send error:", error);
      toast.error("An error occurred while sending message.");
    }
  } finally {
    setSending(false);
  }
};


  useEffect(() => {
    // When a new user logs in, clear the selected conversation and messages
    setSelectedConversation(null);
    setMessage([]);
  }, [authUser._id, setSelectedConversation, setMessage]);

  //blocking page

  return (
    <div className="main">
      {selectedConversation === null ? (
        <div className="head">
          <p className="para">
            Welcome!! <span className="naam">{authUser.username}</span>
          </p>
          <TiMessages className="type" />
          <p className="para">
            Start Chatting With Friends{" "}
            <img src="./squid game.png" alt="" className="squid" />
          </p>
        </div>
      ) : (
        <>
          <div className="class1">
            <div className="class2">
              <div className="class3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="class4"
                >
                  <IoArrowBackSharp />
                </button>
              </div>
              <div className="showprofile">
                <img
                  src={
                    selectedConversation?.profilepic?.startsWith("http")
                      ? selectedConversation.profilepic
                      : `http://localhost:3000/${selectedConversation.profilepic}`
                  }
                  alt="Profile"
                  className="imgclass"
                />

                
              </div>
              <div className="showusername">
                {selectedConversation?.username}
                {isTyping && (
                  <span className="typing-status"> is typing...</span>
                )}
              </div>
              <div className="report">
  <button onClick={() => handleReport(selectedConversation._id)}>
    Report User
  </button>
</div>

            </div>
            
          </div>

          

          <div className="showmessage">
            {loading && (
              <div className="spinner">
                <div className="Loading"></div>
              </div>
            )}
            {!loading && messages?.length === 0 && (
              <p className="noconver">
                Send a message to start a conversation{" "}
                <img src="./squid game.png" alt="" className="squid" />
              </p>
            )}
            {!loading &&
              messages?.length > 0 &&
              messages.map((message) => (
                <div key={message._id} ref={lastMessageRef}>
                  <div
                    className={`message-container ${
                      message.senderId._id === authUser?._id
                        ? "message-right"
                        : "message-left"
                    }`}
                  >
                    <div className="chat-bubble">
                      
                      {parseMessageWithLinks(message.message)}
                      {(message.senderId === authUser._id ||
                        message.senderId?._id === authUser._id) && (
                        <span className="read-status">
                          {message.isSeen ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                    <div className="date-time">
                      {new Date(message?.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                      {" • "}
                      {new Date(message?.createdAt).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <form className="send" onSubmit={handleSubmit}>
            <div className="sendtext">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="emoji-toggle"
              >
                😊
              </button>

              <input
                value={sendData}
                onChange={handleMessage}
                required
                id="message"
                type="text"
                className="textinput"
              />

              <button type="submit" className="aero">
                {sending ? (
                  <div className="loadingspin"></div>
                ) : (
                  <IoSend className="sendbutton" />
                )}
              </button>
            </div>

            {showEmojiPicker && (
              <div className="emoji-picker-container">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setSendData((prev) => prev + emojiData.emoji);
                    setShowEmojiPicker(false); // optional: close picker after choosing
                  }}
                  theme="dark" // or "light"
                />
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default MessageContainer;
