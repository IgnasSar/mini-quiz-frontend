import React, { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("user")) navigate("/dashboard");
  }, [navigate]);

  const handleSuccess = async (credentialResponse) => {
    try {
      console.log("Sending Google Token to backend...");
      const res = await api.post("/Auth/google-login", {
        idToken: credentialResponse.credential,
      });
      
      console.log("Backend response:", res.data);
      const userData = res.data;
      sessionStorage.setItem("user", JSON.stringify(userData));
      if (userData.avatarUrl) sessionStorage.setItem("currentAvatar", userData.avatarUrl);
      
      navigate("/dashboard");
    } catch (err) {
      console.error("FULL LOGIN ERROR:", err);
      
      if (err.response && err.response.data && err.response.data.message) {
          alert(`Login Error: ${err.response.data.message}\nDetails: ${err.response.data.details || ''}`);
      } else {
          alert(`Login Failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      <div className="login-card">
        <h1 className="login-title">MiniQuiz</h1>
        <p className="login-subtitle">Join the ultimate trivia battle!</p>
        <div className="google-btn-wrapper">
            <GoogleLogin 
                onSuccess={handleSuccess} 
                onError={() => alert("Google Sign-In failed to start.")} 
                theme="filled_black" 
                shape="pill" 
                size="large" 
            />
        </div>
      </div>
    </div>
  );
}
