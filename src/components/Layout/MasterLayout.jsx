import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "../../helper/api_helper";

const MasterLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const location = useLocation();
    const navigate = useNavigate();

    // Check calendar status
    useEffect(() => {
        const checkCalendar = async () => {
            try {
                const response = await get("/api/doctor-portal/calendar-status");
                if (response.status) {
                    const doctorData = JSON.parse(localStorage.getItem("doctorData") || "{}");

                    // Update local storage if status changed
                    if (doctorData.isCalendarConnected !== response.isCalendarConnected) {
                        doctorData.isCalendarConnected = response.isCalendarConnected;
                        localStorage.setItem("doctorData", JSON.stringify(doctorData));
                    }

                    // Redirect if disconnected and not already on connection page
                    if (!response.isCalendarConnected && location.pathname !== "/connect-calendar") {
                        navigate("/connect-calendar");
                    }
                }
            } catch (error) {
                console.error("Failed to check calendar status", error);
            }
        };

        checkCalendar();
    }, [location.pathname, navigate]);

    // Close sidebar on route change (mobile only)

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[55] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <main className={`transition-all duration-300 pt-[70px] min-h-screen ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
                {/* Note: keeping pl-64 for desktop as default for now, can be toggled if needed */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="p-4 md:p-8"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default MasterLayout;
