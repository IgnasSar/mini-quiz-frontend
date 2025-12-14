import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyQuizzes from "./pages/MyQuizzes";
import CommunityLibrary from "./pages/CommunityLibrary";
import EditQuiz from "./pages/EditQuiz";
import Lobby from "./pages/Lobby";
import HostGame from "./pages/HostGame";
import PlayerGame from "./pages/PlayerGame";
import Social from "./pages/Social";
import ProtectedRoute from "./components/ProtectedRoute";

const GOOGLE_CLIENT_ID = "93845720486-edfdn06hfn6kdhku9rfp6la69b63pidf.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/my-quizzes" element={<MyQuizzes />} />
            <Route path="/community" element={<CommunityLibrary />} />
            <Route path="/social" element={<Social />} />
            <Route path="/edit-quiz/:quizId" element={<EditQuiz />} />
            
            <Route path="/lobby/:roomCode" element={<Lobby />} />
            <Route path="/host/:roomCode" element={<HostGame />} />
            <Route path="/play/:roomCode" element={<PlayerGame />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}
