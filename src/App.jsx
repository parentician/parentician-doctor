import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
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
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ConnectCalendar from "./pages/ConnectCalendar/ConnectCalendar";
import "./index.css";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("doctorToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const CalendarRoute = ({ children }) => {
  const [searchParams] = useSearchParams();
  const doctorData = JSON.parse(localStorage.getItem("doctorData") || "{}");

  // Check if we just returned from successful connection
  const justConnected = searchParams.get("calendarConnected") === "true";

  if (justConnected && !doctorData.isCalendarConnected) {
    doctorData.isCalendarConnected = true;
    localStorage.setItem("doctorData", JSON.stringify(doctorData));
  }

  if (!doctorData.isCalendarConnected && !justConnected) {
    return <Navigate to="/connect-calendar" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/connect-calendar" element={
          <ProtectedRoute>
            <ConnectCalendar />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <CalendarRoute>
              <Dashboard />
            </CalendarRoute>
          </ProtectedRoute>
        } />

        <Route path="/appointments" element={
          <ProtectedRoute>
            <CalendarRoute>
              <Appointments />
            </CalendarRoute>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <CalendarRoute>
              <Profile />
            </CalendarRoute>
          </ProtectedRoute>
        } />

        <Route path="/availability" element={
          <ProtectedRoute>
            <CalendarRoute>
              <Availability />
            </CalendarRoute>
          </ProtectedRoute>
        } />

        <Route path="/earnings" element={
          <ProtectedRoute>
            <CalendarRoute>
              <Earnings />
            </CalendarRoute>
          </ProtectedRoute>
        } />

        <Route path="/patients" element={
          <ProtectedRoute>
            <CalendarRoute>
              <Patients />
            </CalendarRoute>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <CalendarRoute>
              <Settings />
            </CalendarRoute>
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <CalendarRoute>
              <Notifications />
            </CalendarRoute>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl font-bold">404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
