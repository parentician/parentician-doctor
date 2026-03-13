import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { post } from "../../helper/api_helper";

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        if (newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setLoading(true);

        try {
            const response = await post("/api/doctor-portal/reset-password", {
                token,
                newPassword
            });

            if (response.status) {
                toast.success(response.message || "Password set successfully!");
                navigate("/login");
            } else {
                toast.error(response.message || "Failed to set password");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or expired token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-neutral-200"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src="/parentician-logo.png" alt="Logo" className="h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand">Set Your Password</h2>
                    <p className="text-neutral-500 mt-2">Create a secure password for your account</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">New Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                                <Icon icon="solar:lock-password-bold" className="text-xl" />
                            </span>
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Confirm Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                                <Icon icon="solar:lock-password-bold" className="text-xl" />
                            </span>
                            <input
                                type="password"
                                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand text-white py-3 rounded-lg font-bold transition-all duration-300 hover:bg-brand-dark shadow-lg shadow-brand/20 flex items-center justify-center disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : "Set Password"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                    <p className="text-sm text-neutral-500">Remembered your password? <span onClick={() => navigate("/login")} className="text-brand font-semibold cursor-pointer">Back to Login</span></p>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
