import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Dummy Authentication Logic
        setTimeout(() => {
            if (email === "doctor@parentician.com" && password === "password123") {
                const dummyDoctor = {
                    id: "doc_123",
                    doctor_name: "Dr. Sandeep Gupta",
                    image: "https://i.pravatar.cc/150?u=doc_123",
                    degree: "MD, Pediatrics",
                    email: email
                };
                localStorage.setItem("doctorToken", "dummy_jwt_token_456");
                localStorage.setItem("doctorData", JSON.stringify(dummyDoctor));
                toast.success("Welcome back, Dr. Gupta!");
                navigate("/dashboard");
            } else {
                toast.error("Invalid credentials. Try doctor@parentician.com / password123");
            }
            setLoading(false);
        }, 1000);
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
                    <p className="text-neutral-500 mt-2">Sign in to manage your consultations</p>
                </div>

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

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input type="checkbox" id="remember" className="h-4 w-4 text-brand focus:ring-brand border-neutral-300 rounded" />
                            <label htmlFor="remember" className="ml-2 block text-sm text-neutral-600">Remember me</label>
                        </div>
                        <a href="#" className="text-sm font-semibold text-brand hover:text-brand-dark">Forgot Password?</a>
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

                <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                    <p className="text-sm text-neutral-500">Don't have an account? <span className="text-brand font-semibold cursor-pointer">Contact Administration</span></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
