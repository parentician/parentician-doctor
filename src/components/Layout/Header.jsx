import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const doctorData = JSON.parse(localStorage.getItem("doctorData") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("doctorToken");
        localStorage.removeItem("doctorData");
        window.location.href = "/login";
    };

    return (
        <header className={`h-[70px] bg-white border-b border-neutral-200 fixed top-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 transition-all duration-300 ${isSidebarOpen ? 'left-0 lg:left-64' : 'left-0'}`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-neutral-50 rounded-lg"
                >
                    <Icon icon={isSidebarOpen ? "solar:sidebar-minimalistic-linear" : "solar:hamburger-menu-bold"} className="text-2xl text-neutral-600" />
                </button>
                <h1 className="text-xl font-bold text-neutral-800 hidden sm:block">Dashboard</h1>
            </div>

            <div className="flex items-center gap-6">
                <Link to="/notifications" className="relative group p-2 hover:bg-neutral-50 rounded-full cursor-pointer transition-colors duration-200">
                    <Icon icon="solar:bell-bold" className="text-2xl text-neutral-500" />
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand border-2 border-white rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                        3
                    </span>
                </Link>

                <div className="flex items-center gap-3 group relative cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-neutral-800 leading-tight">
                            {doctorData.doctor_name || "Doctor"}
                        </p>
                        <p className="text-xs text-neutral-500 leading-tight">Consultation Doctor</p>
                    </div>
                    <img
                        src="doctor_img.jpg"
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-neutral-200 object-cover"
                    />

                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-brand-light hover:text-brand">
                            <Icon icon="solar:user-circle-bold" /> My Profile
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-brand-light hover:text-brand">
                            <Icon icon="solar:settings-bold" /> Settings
                        </Link>
                        <hr className="my-2 border-neutral-100" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                        >
                            <Icon icon="solar:logout-bold" /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
