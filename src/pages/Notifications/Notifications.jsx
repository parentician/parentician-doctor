import { useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";

const Notifications = () => {
    const [activeTab, setActiveTab] = useState("ALL");

    const notifications = [
        { id: 1, type: "APPOINTMENT", title: "New Appointment Booked", message: "Riya Sharma has booked a session for Feb 21, 10:30 AM", time: "2 mins ago", unread: true },
        { id: 2, type: "SYSTEM", title: "Google Calendar Sync", message: "Your calendar has been successfully synchronized.", time: "1 hour ago", unread: false },
        { id: 3, type: "EARNINGS", title: "Payout Processed", message: "Your payout of ₹12,400 has been sent to your bank account.", time: "5 hours ago", unread: false },
        { id: 4, type: "APPOINTMENT", title: "Appointment Cancelled", message: "Vikram Singh cancelled the session for Feb 18.", time: "1 day ago", unread: false },
    ];

    const getIcon = (type) => {
        switch (type) {
            case "APPOINTMENT": return { icon: "solar:calendar-date-bold", color: "text-blue-500", bg: "bg-blue-50" };
            case "EARNINGS": return { icon: "solar:wallet-money-bold", color: "text-green-500", bg: "bg-green-50" };
            default: return { icon: "solar:bell-bold", color: "text-amber-500", bg: "bg-amber-50" };
        }
    };

    const filtered = activeTab === "ALL" ? notifications : notifications.filter(n => n.type === activeTab);

    return (
        <MasterLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-neutral-800">Notifications</h2>
                    <button className="text-sm font-bold text-brand hover:underline">Mark all as read</button>
                </div>

                <div className="flex bg-neutral-100 p-1 rounded-xl w-fit">
                    {["ALL", "APPOINTMENT", "EARNINGS", "SYSTEM"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white text-brand shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="card-container divide-y divide-neutral-100">
                    {filtered.map(notif => {
                        const style = getIcon(notif.type);
                        return (
                            <div key={notif.id} className={`p-6 flex items-start gap-4 hover:bg-neutral-50 transition-colors cursor-pointer ${notif.unread ? 'bg-brand/5 border-l-4 border-l-brand' : ''}`}>
                                <div className={`${style.bg} ${style.color} p-3 rounded-2xl`}>
                                    <Icon icon={style.icon} className="text-xl" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-neutral-800">{notif.title}</h4>
                                        <span className="text-[10px] font-bold text-neutral-400">{notif.time}</span>
                                    </div>
                                    <p className="text-sm text-neutral-500 leading-relaxed">{notif.message}</p>
                                </div>
                                {notif.unread && (
                                    <div className="w-2 h-2 bg-brand rounded-full mt-2 animate-pulse" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </MasterLayout>
    );
};

export default Notifications;
