import { useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("ACCOUNT");
    const [loading, setLoading] = useState(false);

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        appointments: true,
        earnings: true
    });

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            toast.success("Password changed successfully!");
            setLoading(false);
            e.target.reset();
        }, 1500);
    };

    const toggleNotification = (key) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
    };

    return (
        <MasterLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-neutral-800">Account Settings</h2>

                <div className="flex border-b border-neutral-200 gap-8 mb-8">
                    <button
                        onClick={() => setActiveTab("ACCOUNT")}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'ACCOUNT' ? 'text-brand' : 'text-neutral-500'}`}
                    >
                        Security & Password
                        {activeTab === 'ACCOUNT' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("NOTIFICATIONS")}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'NOTIFICATIONS' ? 'text-brand' : 'text-neutral-500'}`}
                    >
                        Notification Preferences
                        {activeTab === 'NOTIFICATIONS' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-t-full" />}
                    </button>
                </div>

                {activeTab === "ACCOUNT" ? (
                    <div className="space-y-6">
                        <div className="card-container p-8">
                            <h4 className="text-lg font-bold text-neutral-800 mb-6">Change Password</h4>
                            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Current Password</label>
                                    <input type="password" required className="input-field" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">New Password</label>
                                    <input type="password" required className="input-field" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Confirm New Password</label>
                                    <input type="password" required className="input-field" placeholder="••••••••" />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full mt-4"
                                >
                                    {loading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex justify-between items-center">
                            <div>
                                <h5 className="font-bold text-red-800">Danger Zone</h5>
                                <p className="text-sm text-red-600 mt-1">Permanently delete your account and all data. This action is irreversible.</p>
                            </div>
                            <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                                Delete Account
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card-container p-8 divide-y divide-neutral-100">
                        <div className="pb-6">
                            <h4 className="text-lg font-bold text-neutral-800 mb-2">Platform Notifications</h4>
                            <p className="text-sm text-neutral-500">How you want to receive updates on Parentician</p>
                        </div>

                        {[
                            { id: 'email', label: 'Email Notifications', desc: 'Receive reports and activity logs via email' },
                            { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts in your browser' },
                            { id: 'sms', label: 'SMS Notifications', desc: 'Instant SMS for emergency consultations' },
                            { id: 'appointments', label: 'Appointment Reminders', desc: 'Get notified 30 mins before a session' },
                            { id: 'earnings', label: 'Earnings Reports', desc: 'Weekly summary of your revenue' },
                        ].map(item => (
                            <div key={item.id} className="py-6 flex items-center justify-between">
                                <div>
                                    <h5 className="font-bold text-neutral-800">{item.label}</h5>
                                    <p className="text-sm text-neutral-500">{item.desc}</p>
                                </div>
                                <div
                                    onClick={() => toggleNotification(item.id)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${notifications[item.id] ? 'bg-brand' : 'bg-neutral-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${notifications[item.id] ? 'translate-x-7' : 'translate-x-1'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MasterLayout>
    );
};

export default Settings;
