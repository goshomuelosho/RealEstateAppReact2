import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyEstates from "./pages/MyEstates";
import AddEstate from "./pages/AddEstate";
import EditEstate from "./pages/EditEstate";
import EstateDetail from "./pages/EstateDetail";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      {/* 🔓 Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🔐 Protected routes */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/my-estates" element={<MyEstates />} />
      <Route path="/add-estate" element={<AddEstate />} />
      <Route path="/edit-estate/:id" element={<EditEstate />} />
      <Route path="/estate/:id" element={<EstateDetail />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
