import { useState, useEffect } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { post, get } from "../../helper/api_helper";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("ACCOUNT");
    const [loading, setLoading] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [qrCode, setQrCode] = useState("");
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disableToken, setDisableToken] = useState("");
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await get("/api/doctor-portal/profile");
            if (response.status) {
                setIs2FAEnabled(response.data.isTwoFactorEnabled);
            }
        } catch (error) {
            console.error("Fetch Profile Error:", error);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const response = await post("/api/doctor-portal/change-password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });

            if (response.status) {
                toast.success("Password changed successfully!");
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            } else {
                toast.error(response.message || "Failed to update password");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSetup2FA = async () => {
        setSetupLoading(true);
        try {
            const response = await get("/api/doctor-portal/2fa/setup");
            if (response.status) {
                setQrCode(response.data.qrCode);
                setShowScanner(true);
            } else {
                toast.error(response.message || "Failed to setup 2FA");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setSetupLoading(false);
        }
    };

    const handleVerifyAndEnable2FA = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await post("/api/doctor-portal/2fa/verify", {
                token: twoFactorToken
            });

            if (response.status) {
                setIs2FAEnabled(true);
                setShowScanner(false);
                setTwoFactorToken("");
                toast.success("2FA enabled successfully!");
            } else {
                toast.error(response.message || "Invalid token");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable2FA = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await post("/api/doctor-portal/2fa/disable", {
                token: disableToken
            });

            if (response.status) {
                setIs2FAEnabled(false);
                setShowDisableModal(false);
                setDisableToken("");
                toast.success("2FA disabled successfully");
            } else {
                toast.error(response.message || "Failed to disable 2FA");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateAccount = async () => {
        setLoading(true);
        try {
            const response = await post("/api/doctor-portal/deactivate-account");
            if (response.status) {
                toast.success("Your account will be deactivated permanently.");
                // The api_helper logoutAndRedirect handles the logout
                localStorage.removeItem("doctorToken");
                localStorage.removeItem("doctorData");
                window.location.href = "/login";
            } else {
                toast.error(response.message || "Failed to deactivate account");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
            setShowDeactivateModal(false);
        }
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
                        onClick={() => setActiveTab("2FA")}
                        className={`pb-4 text-sm font-bold transition-all relative ${activeTab === '2FA' ? 'text-brand' : 'text-neutral-500'}`}
                    >
                        Two-Factor Authentication (2FA)
                        {activeTab === '2FA' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-t-full" />}
                    </button>
                </div>

                {activeTab === "ACCOUNT" ? (
                    <div className="space-y-6">
                        <div className="card-container p-8">
                            <h4 className="text-lg font-bold text-neutral-800 mb-6">Change Password</h4>
                            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    />
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
                                <p className="text-sm text-red-600 mt-1">Your account will be deactivated permanently. If you want to activate it again in the future, please contact the admin.</p>
                            </div>
                            <button 
                                onClick={() => setShowDeactivateModal(true)}
                                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                Deactivate Account
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card-container p-8">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                            <div>
                                <h4 className="text-xl font-bold text-neutral-800">Two-Factor Authentication</h4>
                                <p className="text-sm text-neutral-500 mt-1">Add an extra layer of security to your account</p>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${is2FAEnabled ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                {is2FAEnabled ? "PROTECTED" : "UNPROTECTED"}
                            </div>
                        </div>

                        {!is2FAEnabled && !showScanner ? (
                            <div className="max-w-md mx-auto text-center space-y-6 py-8">
                                <div className="w-20 h-20 bg-brand-light rounded-3xl flex items-center justify-center mx-auto text-brand">
                                    <Icon icon="solar:shield-keyhole-bold-duotone" className="text-5xl" />
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-lg font-bold text-neutral-800">Secure Your Account</h5>
                                    <p className="text-sm text-neutral-500 leading-relaxed">
                                        Use an authenticator app (like Google Authenticator or Authy) to generate secure verification codes.
                                    </p>
                                </div>
                                <button
                                    onClick={handleSetup2FA}
                                    disabled={setupLoading}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {setupLoading ? (
                                        "Starting Setup..."
                                    ) : (
                                        <>
                                            <Icon icon="solar:qr-code-bold" className="text-xl" />
                                            <span>Setup Authenticator</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : showScanner ? (
                            <div className="max-w-md mx-auto text-center space-y-6 py-8 animate-in fade-in zoom-in duration-300">
                                <div className="p-4 bg-white border-2 border-dashed border-neutral-200 rounded-3xl inline-block mx-auto">
                                    <div className="w-48 h-48 bg-neutral-50 flex items-center justify-center rounded-2xl relative group overflow-hidden">
                                        {qrCode ? (
                                            <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
                                        ) : (
                                            <Icon icon="solar:qr-code-bold" className="text-8xl text-neutral-200" />
                                        )}
                                        <div className="absolute inset-0 bg-brand/5 flex items-center justify-center pointer-events-none">
                                            <div className="w-full h-1 bg-brand absolute top-0 animate-[scan_2s_infinite]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-neutral-800">Scan QR Code</p>
                                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">Scan this code in your authenticator app and enter the 6-digit code below to confirm.</p>
                                </div>

                                <form onSubmit={handleVerifyAndEnable2FA} className="space-y-4">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="000000"
                                        className="w-full py-3 border border-neutral-300 rounded-lg text-center tracking-[1em] font-bold text-lg focus:ring-brand/20 focus:border-brand"
                                        value={twoFactorToken}
                                        onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ""))}
                                        required
                                    />
                                    <div className="flex flex-col gap-3">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary w-full"
                                        >
                                            {loading ? "Verifying..." : "Confirm & Enable 2FA"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowScanner(false);
                                                setTwoFactorToken("");
                                            }}
                                            className="text-sm font-bold text-neutral-500 hover:text-neutral-700 font-bold"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between p-6 bg-green-50 rounded-2xl border border-green-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                                            <Icon icon="solar:shield-check-bold" className="text-2xl" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-neutral-800">Two-Factor Authentication is ON</h5>
                                            <p className="text-xs text-neutral-500">Your account is secured with an authenticator app.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowDisableModal(true)}
                                        disabled={loading}
                                        className="px-4 py-2 text-red-600 text-xs font-bold hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        {loading ? "Disabling..." : "Disable 2FA"}
                                    </button>
                                </div>

                                <div className="p-4 bg-brand-light/30 rounded-2xl border border-brand/10 flex gap-3 text-brand">
                                    <Icon icon="solar:info-circle-bold" className="text-xl shrink-0" />
                                    <p className="text-xs leading-relaxed font-medium">
                                        Recommendation: If you lose access to your authenticator app, please contact administration to reset your 2FA.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Disable 2FA Modal */}
            {showDisableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                                <Icon icon="solar:shield-warning-bold" className="text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-800 mb-2">Disable 2FA?</h3>
                            <p className="text-neutral-500 mb-8 leading-relaxed">
                                This will remove the extra layer of security from your account. Please enter your 6-digit verification code to confirm.
                            </p>

                            <form onSubmit={handleDisable2FA} className="space-y-6">
                                <div>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            maxLength="6"
                                            className="w-full py-4 border-2 border-neutral-100 rounded-2xl text-center tracking-[0.8em] font-black text-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 bg-neutral-50/50 group-hover:bg-white"
                                            placeholder="000000"
                                            value={disableToken}
                                            onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ""))}
                                            required
                                            autoFocus
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 rounded-full" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-70"
                                    >
                                        {loading ? "Disabling..." : "Disable Security"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDisableModal(false);
                                            setDisableToken("");
                                        }}
                                        className="w-full py-4 text-neutral-500 font-bold hover:text-neutral-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Deactivate Account Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 mx-auto">
                                <Icon icon="solar:danger-bold" className="text-5xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-800 mb-2">Deactivate Account?</h3>
                            <p className="text-neutral-500 mb-8 leading-relaxed">
                                Your account will be deactivated permanently. If you want to activate it again in the future, please contact the admin.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeactivateAccount}
                                    disabled={loading}
                                    className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-70"
                                >
                                    {loading ? "Deactivating..." : "Yes, Deactivate My Account"}
                                </button>
                                <button
                                    onClick={() => setShowDeactivateModal(false)}
                                    className="w-full py-4 text-neutral-500 font-bold hover:text-neutral-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

export default Settings;
