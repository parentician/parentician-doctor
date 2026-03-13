import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { post } from "../../helper/api_helper";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [step, setStep] = useState("LOGIN"); // LOGIN or VERIFY_2FA
    const [doctorId, setDoctorId] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const message = localStorage.getItem("logoutMessage");
        if (message) {
            toast.error(message);
            localStorage.removeItem("logoutMessage");
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await post("/api/doctor-portal/login", { email, password });
            if (response.status) {
                if (response.message === "2FA_REQUIRED") {
                    setStep("VERIFY_2FA");
                    setDoctorId(response.data.doctorId);
                    toast.success("Two-Factor Authentication Required");
                } else {
                    completeLogin(response);
                }
            } else {
                toast.error(response.message || "Login failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials or server error");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await post("/api/doctor-portal/login/verify-2fa", {
                doctorId,
                twoFactorToken
            });

            if (response.status) {
                completeLogin(response);
            } else {
                toast.error(response.message || "Invalid 2FA token");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const completeLogin = (response) => {
        localStorage.setItem("doctorToken", response.accessToken);
        localStorage.setItem("doctorData", JSON.stringify(response.data));
        toast.success(`Welcome back, ${response.data.doctor_name}!`);

        if (response.data.isCalendarConnected) {
            navigate("/dashboard");
        } else {
            navigate("/connect-calendar");
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
                    <h2 className="text-2xl font-bold text-brand">Doctor Portal</h2>
                    <p className="text-neutral-500 mt-2">
                        {step === 'LOGIN' ? 'Sign in to manage your consultations' : 'Enter the 6-digit code from your authenticator app'}
                    </p>
                </div>

                {step === 'LOGIN' ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                                    <Icon icon="solar:letter-bold" className="text-xl" />
                                </span>
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                                    placeholder="doctor@parentician.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                                    <Icon icon="solar:lock-password-bold" className="text-xl" />
                                </span>
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Login"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify2FA} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">Verification Code</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                                    <Icon icon="solar:shield-keyhole-bold" className="text-xl" />
                                </span>
                                <input
                                    type="text"
                                    maxLength="6"
                                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200 text-center tracking-[1em] font-bold text-lg"
                                    placeholder="000000"
                                    value={twoFactorToken}
                                    onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ""))}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-brand text-white py-3 rounded-lg font-bold transition-all duration-300 hover:bg-brand-dark shadow-lg shadow-brand/20 flex items-center justify-center disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep("LOGIN")}
                            className="w-full text-sm font-semibold text-neutral-500 hover:text-neutral-700"
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                    <p className="text-sm text-neutral-500">Don't have an account? <span className="text-brand font-semibold cursor-pointer">Contact Administration</span></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
