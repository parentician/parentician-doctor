import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const doctorData = JSON.parse(localStorage.getItem("doctorData") || "{}");

    const menuItems = [
        { title: "Dashboard", icon: "solar:widget-bold", path: "/dashboard" },
        { title: "Appointments", icon: "solar:calendar-date-bold", path: "/appointments" },
        { title: "My Profile", icon: "solar:user-circle-bold", path: "/profile" },
        { title: "My Availability", icon: "solar:clock-circle-bold", path: "/availability" },
        { title: "Earnings & Reports", icon: "solar:bill-list-bold", path: "/earnings" },
        { title: "Patients", icon: "solar:users-group-rounded-bold", path: "/patients" },
        { title: "Settings", icon: "solar:settings-bold", path: "/settings" },
    ];

    return (
        <aside className={`w-64 h-screen bg-white border-r border-neutral-200 fixed left-0 top-0 z-[60] overflow-y-auto transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-4 flex items-center justify-between gap-3 border-b border-neutral-200">
                <div className="flex items-center gap-3 justify-center flex-1">
                    <img src="/parentician-logo.png" alt="Logo" className="h-12" />
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 lg:hidden text-neutral-400 hover:text-brand"
                >
                    <Icon icon="solar:close-circle-bold" className="text-2xl" />
                </button>
            </div>

            <nav className="mt-4 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${location.pathname === item.path
                            ? "bg-brand text-white shadow-lg shadow-brand/20"
                            : "text-neutral-500 hover:bg-brand-light hover:text-brand"
                            }`}
                    >
                        <Icon
                            icon={item.icon}
                            className={`text-xl ${location.pathname === item.path ? "text-white" : "group-hover:text-brand"}`}
                        />
                        <span className="font-medium">{item.title}</span>
                    </Link>
                ))}
            </nav>

            <div className="absolute bottom-6 left-0 w-full px-6 space-y-4">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold">
                        {doctorData.doctor_name ? doctorData.doctor_name.charAt(0) : "G"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-neutral-800 truncate">{doctorData.doctor_name || "Doctor"}</p>
                        <p className="text-xs text-neutral-500 truncate">Specialist</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem("doctorToken");
                        localStorage.removeItem("doctorData");
                        window.location.href = "/login";
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold"
                >
                    {/* <Icon icon="solar:logout-bold" className="text-xl" /> */}
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
