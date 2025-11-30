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
      const res = await api.post("/Auth/google-login", {
        idToken: credentialResponse.credential,
      });
      const userData = res.data;
      sessionStorage.setItem("user", JSON.stringify(userData));
      if (userData.avatarUrl) sessionStorage.setItem("currentAvatar", userData.avatarUrl);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      <div className="login-card">
        <h1 className="login-title">MiniQuiz</h1>
        <p className="login-subtitle">Join the ultimate trivia battle!</p>
        <div className="google-btn-wrapper">
            <GoogleLogin onSuccess={handleSuccess} onError={() => alert("Failed")} theme="filled_black" shape="pill" size="large" />
        </div>
      </div>
    </div>
  );
}
