import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';
import '../Home/Components/MessageContainer.css';

import { toast } from "react-toastify";
const ProfilePage = () => {
  const { authUser, setAuthUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("profilepic", image);

    try {
      setUploading(true);
      const res = await axios.post(
        "http://localhost:3000/api/pic/upload-pic",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data.success) {
        const updatedUser = res.data.user;
        setUserData(updatedUser);
        setAuthUser(updatedUser);
        toast.success("Profile picture updated");
        setImage(null);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/profile', { withCredentials: true });
        if (response.data.success) {
          setUserData(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserProfile();
    }
  }, [authUser]);



  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!userData) {
    return <div className="error">No profile data available</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>
          Profile <img src="../profile.png" alt="profile" className="squidp" />
        </h2>
      </div>
      <div className="profile-info">
        <div className="profile-pic">
          <img
            src={`http://localhost:3000/${userData.profilepic || "uploads/default.png"}`}
            alt="Profile"
            className="profile-image"
          />
          <div className="upload-section">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Profile Picture"}
            </button>
          </div>
        </div>
        <div className="profile-details">
          <h3>{userData.fullname}</h3>
          <p><strong>Username:</strong> {userData.username}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Gender:</strong> {userData.gender}</p>
        </div>
      </div>

      {/* Report button (only if viewing another user's profile) */}
      
    </div>
    
  );
};

export default ProfilePage;
