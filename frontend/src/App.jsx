import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Planner from "./stranice/Planner.jsx";
import Login from "./stranice/Login.jsx";
import Register from "./stranice/Register.jsx";
import ProtectedRoute from "./komponente/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
