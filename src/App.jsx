import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Appointments from "./pages/Appointments/Appointments";
import Profile from "./pages/Profile/Profile";
import Availability from "./pages/Availability/Availability";
import Earnings from "./pages/Earnings/Earnings";
import Patients from "./pages/Patients/Patients";
import Settings from "./pages/Settings/Settings";
import Notifications from "./pages/Notifications/Notifications";
import "./index.css";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("doctorToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/availability" element={
          <ProtectedRoute>
            <Availability />
          </ProtectedRoute>
        } />

        <Route path="/earnings" element={
          <ProtectedRoute>
            <Earnings />
          </ProtectedRoute>
        } />

        <Route path="/patients" element={
          <ProtectedRoute>
            <Patients />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl font-bold">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
