import React, { useState } from 'react';
import axios from 'axios';
import SideBar from './Components/SideBar';
import MessageContainer from './Components/MessageContainer';
import './Home.css';
import { FaRobot } from 'react-icons/fa'; // Gemini icon

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Gemini panel states
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsSidebarVisible(false);
  };

  const handleShowSidebar = () => {
    setIsSidebarVisible(true);
    setSelectedUser(null);
  };

  const toggleGeminiPanel = () => {
    setIsGeminiOpen(!isGeminiOpen);
  };

  const handleGeminiPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');

    try {
      const res = await axios.post('http://localhost:3000/api/v1/generate', { prompt });
      setResponse(res.data.response);
    } catch (error) {
      console.error(error);
      setResponse('Error contacting Gemini API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className={`sidebar-containerx ${isSidebarVisible}`}>
        <SideBar onSelectUser={handleUserSelect} />
      </div>
      <div className="message-container-wrapper">
        <MessageContainer onBackUser={handleShowSidebar} />
      </div>

      {/* Floating Gemini Icon */}
      <div className="floating-gemini-btn" onClick={toggleGeminiPanel}>
        <img className='wo' src='../public/woman.png' />
      </div>

      {/* Gemini Panel */}
      {isGeminiOpen && (
        <div className="gemini-panel">
          <div className="gemini-header">
            <img className='wo' src='../public/woman.png' />
            <button onClick={toggleGeminiPanel} className='x'>X</button>
          </div>
          <textarea
            placeholder="Ask something..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={handleGeminiPrompt} disabled={loading}>
            {loading ? 'Loading...' : 'Send'}
          </button>
          <div className="gemini-response">{response}</div>
        </div>
      )}
    </div>
  );
};

export default Home;
