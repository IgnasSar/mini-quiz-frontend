import React, { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css";

const GITHUB_CLIENT_ID = "Ov23likxXrr5S2Pcmrlc";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("user")) {
        navigate("/dashboard");
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");

    if (authCode) {
        setLoading(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        handleGitHubLogin(authCode);
    }
  }, [navigate]);

  const saveUser = (data) => {
    sessionStorage.setItem("user", JSON.stringify(data));
    if (data.avatarUrl) sessionStorage.setItem("currentAvatar", data.avatarUrl);
    navigate("/dashboard");
  };

  const handleGitHubLogin = async (code) => {
      try {
          const res = await api.post("/Auth/github-login", { token: code });
          saveUser(res.data);
      } catch (err) { 
          setLoading(false);
          setError(err.response?.data?.message || "GitHub Login Failed"); 
      }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const res = await api.post("/Auth/google-login", { token: tokenResponse.access_token });
      saveUser(res.data);
    } catch (err) { 
      setLoading(false);
      setError(err.response?.data?.message || "Google Login failed"); 
    }
  };

  const loginToGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
        setLoading(false);
        setError("Google Login Failed - Check Console Configuration");
    },
    scope: "email profile openid",
  });

  const handleLocal = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const endpoint = isRegister ? "/Auth/register" : "/Auth/login";
    
    try {
        const res = await api.post(endpoint, formData);
        saveUser(res.data);
    } catch (err) {
        setError(err.response?.data?.message || "Authentication failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  const initiateGitHub = () => {
    const scope = "user:email";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scope}`;
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="brand-title">MiniQuiz</h1>
        <p className="brand-subtitle">{isRegister ? "Create your account" : "Welcome back, player!"}</p>

        {error && <div className="error-banner">{error}</div>}
        {loading && <div style={{color: 'var(--primary)', marginBottom: '1rem'}}>Authenticating...</div>}

        <form onSubmit={handleLocal} className="auth-form">
            {isRegister && (
                <input 
                    type="text" placeholder="Username" required minLength={3}
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                />
            )}
            <input 
                type="email" placeholder="Email Address" required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            <input 
                type="password" placeholder="Password" required minLength={6}
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
            />
            
            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Processing..." : (isRegister ? "Sign Up" : "Sign In")}
            </button>
        </form>

        <div className="divider"><span>OR CONTINUE WITH</span></div>

        <div className="social-grid">
            <button onClick={() => loginToGoogle()} className="social-btn google" title="Google" type="button">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            </button>

            <button onClick={initiateGitHub} className="social-btn github" title="GitHub" type="button">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </button>
        </div>

        <p className="toggle-text">
            {isRegister ? "Already have an account?" : "Don't have an account?"} 
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}>
                {isRegister ? " Sign In" : " Register"}
            </span>
        </p>
      </div>
    </div>
  );
}
