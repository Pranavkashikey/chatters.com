import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import {useAuth} from "../context/AuthContext"
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";



const Login = () => {
    const navigate=useNavigate();
    const {setAuthUser}=useAuth();

    const [userInput,setUserInput]=useState({});
    const [loading,setLoading]=useState(false);

    const handleInput=(e)=>{
        setUserInput({
            ...userInput,[e.target.id]:e.target.value
        })
    }
    console.log(userInput);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post(`/api/auth/login`, userInput);
    const data = res.data;

    console.log("Login response data:", data);

    if (!data.success) {
      toast.error(data.message || "Login failed");
      setLoading(false);
      return;
    }

    toast.success(data.message);

    // Store token and full user data
    localStorage.setItem("token", data.token);             // Separate token
    localStorage.setItem("chatapp", JSON.stringify(data)); // All user data
    setAuthUser(data);

    setLoading(false);

    // Navigate to admin or user dashboard
    if (data.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/");
    }

  } catch (error) {
    setLoading(false);
    console.error("Login error:", error);
    toast.error(error?.response?.data?.message || "Login failed");
  }
};


    const handleGoogleLogin = async (credentialResponse) => {
      try {
        const decoded = jwtDecode(credentialResponse.credential);
        console.log("Decoded Google Token:", decoded);
    
        // ✅ Corrected axios POST request
        const { data } = await axios.post("/api/auth/google", {
          token: credentialResponse.credential,
        });
    
        console.log("Google Login Response:", data);
    
        if (data.success) {
          toast.success(data.message);
          localStorage.setItem("chatapp", JSON.stringify(data));
          setAuthUser(data);
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Google Login Error:", error);
        toast.error(error?.response?.data?.message || "Google login failed");
      }
    };
    
    
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Login Chatters <img src="./squid game.png" alt="loading " className="squid" /></h2>
        <div className="form-group">
          <label htmlFor="username">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            onChange={handleInput}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            onChange={handleInput}
            name="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="login-button">
          {loading ? "loading..":"Login"}
        </button>
        <div className="register-link">
        <p>
          Don't have an account? <Link to="/register">SignUp now</Link>
        </p>
        
        <div className="google">
        <GoogleLogin onSuccess={handleGoogleLogin } onError={() => console.log("Login Failed")} />
        </div>
      </div>
      </form>
      
    </div>
  );
};

export default Login;
