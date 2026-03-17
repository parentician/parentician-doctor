import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const ConnectCalendar = () => {
    const doctorData = JSON.parse(localStorage.getItem("doctorData") || "{}");
    const doctorId = doctorData.id;

    const handleConnect = () => {
        if (!doctorId) {
            toast.error("Doctor session not found. Please log in again.");
            return;
        }
        const apiBaseUrl = import.meta.env.VITE_APP_AUTHDOMAIN;
        // Redirect to backend OAuth initiation
        window.location.href = `${apiBaseUrl}/api/auth/google/connect/${doctorId}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-10 border border-neutral-200 text-center"
            >
                <div className="mb-8">
                    <div className="w-24 h-24 bg-brand-light/20 rounded-full flex items-center justify-center mx-auto text-brand mb-6 shadow-inner">
                        <Icon icon="logos:google-calendar" className="text-5xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-neutral-800">Connect Google Calendar</h2>
                    <p className="text-neutral-500 mt-4 leading-relaxed">
                        To manage your appointments and sync consultations, you need to link your Google Calendar. This is a one-time setup required for all doctors.
                    </p>
                </div>

                <div className="space-y-4 mb-10">
                    <div className="flex items-start gap-4 text-left p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                            <Icon icon="solar:check-circle-bold" className="text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-800">Auto-sync Appointments</p>
                            <p className="text-xs text-neutral-500 mt-1">Appointments will automatically appear in your personal calendar.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 text-left p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                            <Icon icon="solar:videocamera-record-bold" className="text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-800">Google Meet Integration</p>
                            <p className="text-xs text-neutral-500 mt-1">Generate meeting links automatically for your sessions.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleConnect}
                    className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-brand-dark shadow-lg shadow-brand/25 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <Icon icon="logos:google-icon" className="text-xl bg-white rounded-full p-1" />
                    <span>Connect with Google</span>
                </button>

                <p className="mt-8 text-xs text-neutral-400">
                    Your data is safe with us. We only request access to manage calendar events.
                </p>
            </motion.div>
        </div>
    );
};

export default ConnectCalendar;
