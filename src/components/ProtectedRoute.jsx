import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  return user && user.token ? <Outlet /> : <Navigate to="/login" replace />;
}
