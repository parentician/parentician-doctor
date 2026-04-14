import { useState, useEffect } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { get, put } from "../../helper/api_helper"; // your axios helper

const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [doctorData, setDoctorData] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editableBio, setEditableBio] = useState("");
    const [newLanguage, setNewLanguage] = useState("");
    const indianLanguages = [
        "Hindi",
        "English",
        "Bengali",
        "Telugu",
        "Marathi",
        "Tamil",
        "Urdu",
        "Gujarati",
        "Kannada",
        "Odia",
        "Malayalam",
        "Punjabi",
        "Assamese",
        "Maithili",
        "Santali",
        "Kashmiri",
        "Nepali",
        "Konkani",
        "Sindhi",
        "Dogri"
    ];



    const [selectedLang, setSelectedLang] = useState("");

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const res = await get("/api/doctor-portal/profile");

            if (res.status) {
                const data = res.data;
                // Ensure language is an array
                if (data.language && typeof data.language === "string") {
                    data.language = data.language.split(",").map(lang => lang.trim()).filter(Boolean);
                } else if (!data.language) {
                    data.language = [];
                }

                setDoctorData(data);
                localStorage.setItem("doctorData", JSON.stringify(data));
                setEditableBio(data.doctor_bio || "");
                setImagePreview(data.image ? `${IMAGE_BASE_URL}${data.image}` : null);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);

            if (!doctorData) return;

            const formData = new FormData();
            formData.append("doctor_bio", editableBio);
            formData.append("language", (doctorData.language || []).join(","));
            if (selectedImage) {
                formData.append("image", selectedImage);
            }

            const res = await put("/api/doctor-portal/update-profile", formData);

            if (res.status) {
                setDoctorData(res.data);
                localStorage.setItem("doctorData", JSON.stringify(res.data));
                setSelectedImage(null);
                toast.success("Profile updated successfully!");
            }

        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || "Profile update failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const removeLanguage = (lang) => {
        setDoctorData(prev => ({
            ...prev,
            language: prev.language.filter(l => l !== lang)
        }));
    };

    const addLanguage = (lang) => {
        const languageToAdd = lang || newLanguage;
        if (languageToAdd && !doctorData.language.includes(languageToAdd)) {
            setDoctorData(prev => ({
                ...prev,
                language: [...(prev.language || []), languageToAdd]
            }));
            setNewLanguage("");
            setSelectedLang(""); // Reset dropdown if used
        }
    };

    const IMAGE_BASE_URL = `${import.meta.env.VITE_APP_AUTHDOMAIN}/api/get-images/`;

    if (!doctorData) {
        return <div className="p-10 text-center text-neutral-500">Loading your professional profile...</div>;
    }

    return (
        <MasterLayout>
            <div className="max-w-5xl mx-auto space-y-8">

                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-neutral-800">My Profile</h2>

                    <button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 px-6"
                    >
                        {loading ?
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            :
                            <Icon icon="solar:diskette-bold" />
                        }
                        Save Changes
                    </button>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column */}
                    <div className="space-y-6">

                        <div className="card-container p-6 text-center">

                            <div className="relative inline-block">
                                <img
                                    src={imagePreview || "/default-doctor.png"}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full border-4 border-brand-light mx-auto object-cover"
                                />

                                <label className="absolute bottom-0 right-0 p-2 bg-brand text-white rounded-full shadow-lg hover:bg-brand-dark transition-colors cursor-pointer">
                                    <Icon icon="solar:camera-bold" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            <h3 className="text-xl font-bold mt-4">{doctorData.doctor_name}</h3>
                            <p className="text-neutral-500 text-sm">{doctorData.degree}</p>

                            <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${doctorData.google_refresh_token ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                <span className="text-sm font-medium text-neutral-600">
                                    Google Calendar: {doctorData.google_refresh_token ? "Connected" : "Disconnected"}
                                </span>
                            </div>

                        </div>


                        <div className="card-container p-6 space-y-4">

                            <h4 className="font-bold text-neutral-800 border-b border-neutral-100 pb-3">
                                Administrative Details
                            </h4>

                            <div className="space-y-3">

                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Experience</span>
                                    <span className="font-bold text-neutral-800">
                                        {doctorData.experience}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Session Duration</span>
                                    <span className="font-bold text-neutral-800">
                                        {doctorData.session_duration} Minutes
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Doctor Charges</span>
                                    <span className="font-bold text-neutral-800">
                                        ₹{doctorData.doctor_charges}
                                    </span>
                                </div>

                            </div>

                            <p className="text-[10px] text-neutral-400 italic mt-4">
                                * To change administrative details, please contact system admin.
                            </p>

                        </div>

                    </div>


                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Bio */}
                        <div className="card-container p-8">

                            <h4 className="text-lg font-bold text-neutral-800 mb-6">
                                Professional Bio
                            </h4>

                            <textarea
                                className="input-field min-h-[160px] resize-none leading-relaxed"
                                value={editableBio}
                                onChange={(e) => setEditableBio(e.target.value)}
                            />

                            <p className="text-xs text-neutral-400 mt-2">
                                This bio will be visible to patients when they book a session with you.
                            </p>

                        </div>


                        {/* Languages */}
                        <div className="card-container p-8">

                            <div className="flex items-center gap-2 mb-6">
                                <svg height="22" width="22" fill="none" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_69_2763)">
                                        <path d="M18.7734 6.15234C18.3852 6.15234 18.0703 6.46713 18.0703 6.85547C18.0703 7.2438 18.3852 7.55859 18.7734 7.55859H21.0851C21.0899 9.23252 21.6331 10.7961 22.5584 12.0723C21.5997 13.0068 20.3439 13.6446 18.9321 13.8219C18.5468 13.8703 18.2736 14.2218 18.322 14.6071C18.3666 14.9626 18.6694 15.2227 19.0187 15.2227C19.0479 15.2227 19.0775 15.2208 19.1071 15.2171C20.8055 15.0039 22.3201 14.2462 23.4844 13.1334C24.6488 14.2462 26.1634 15.0039 27.8618 15.2171C27.8915 15.2208 27.921 15.2227 27.9502 15.2227C28.2994 15.2227 28.6023 14.9626 28.6469 14.6071C28.6953 14.2218 28.4222 13.8702 28.0368 13.8219C26.625 13.6446 25.3691 13.0068 24.4105 12.0723C25.3357 10.796 25.879 9.23252 25.8838 7.55859H28.1953C28.5836 7.55859 28.8984 7.2438 28.8984 6.85547C28.8984 6.46713 28.5836 6.15234 28.1953 6.15234H24.1875V4.32422C24.1875 3.93588 23.8726 3.62109 23.4844 3.62109C23.0961 3.62109 22.7812 3.93588 22.7812 4.32422V6.15234H18.7734ZM23.4844 10.9338C22.8585 9.95252 22.4959 8.79265 22.4916 7.55859H24.4771C24.4729 8.79265 24.1102 9.95252 23.4844 10.9338Z" fill="#E66F51" />
                                        <path d="M32.2708 0H26.6484C26.2602 0 25.9453 0.314789 25.9453 0.703125C25.9453 1.09146 26.2602 1.40625 26.6484 1.40625H32.2708C33.5517 1.40625 34.5938 2.44835 34.5938 3.7293V15.1145C34.5938 16.3954 33.5516 17.4375 32.2707 17.4375C31.8824 17.4375 31.5676 17.7523 31.5676 18.1406V21.1158L27.4565 17.6059C27.3293 17.4972 27.1674 17.4375 27 17.4375H14.698C13.417 17.4375 12.375 16.3954 12.375 15.1144V3.7293C12.375 2.44835 13.417 1.40625 14.698 1.40625H20.3203C20.7086 1.40625 21.0234 1.09146 21.0234 0.703125C21.0234 0.314789 20.7086 0 20.3203 0H14.698C12.6417 0 10.9688 1.67295 10.9688 3.7293V12.6562H3.72923C1.67295 12.6562 0 14.3292 0 16.3856V27.7708C0 29.5867 1.30486 31.1037 3.02611 31.4336V35.2969C3.02611 35.5712 3.18572 35.8205 3.43484 35.9354C3.52898 35.9788 3.62939 36 3.72916 36C3.89348 36 4.05598 35.9425 4.18584 35.8316L9.25931 31.5H21.3019C23.3583 31.5 25.0312 29.8271 25.0312 27.7707V18.8438H26.7407L31.8142 23.1754C31.944 23.2862 32.1065 23.3438 32.2708 23.3438C32.3706 23.3438 32.471 23.3225 32.5652 23.2791C32.8143 23.1642 32.9739 22.915 32.9739 22.6406L32.974 18.7773C34.6952 18.4475 36.0001 16.9305 36.0001 15.1145V3.7293C36 1.67295 34.3271 0 32.2708 0ZM12.5271 19.6528L13.9201 23.3439H11.1213L12.5271 19.6528ZM23.625 27.7707C23.625 29.0516 22.583 30.0938 21.302 30.0938H9C8.83259 30.0938 8.67073 30.1534 8.54346 30.2621L4.43236 33.7721V30.7969C4.43236 30.4085 4.1175 30.0938 3.72923 30.0938C2.44828 30.0938 1.40625 29.0516 1.40625 27.7707V16.3856C1.40625 15.1046 2.44828 14.0625 3.72923 14.0625H10.9688V15.1144C10.9688 16.053 11.318 16.9109 11.8923 17.5672C11.8162 17.6463 11.7539 17.7404 11.7104 17.8466C11.7082 17.8519 11.706 17.8573 11.7041 17.8627L8.69442 25.765C8.55619 26.1278 8.7383 26.534 9.10118 26.6723C9.46406 26.8104 9.87026 26.6283 10.0085 26.2654L10.5856 24.7502H14.4507L15.0218 26.2634C15.128 26.545 15.3955 26.7185 15.6797 26.7185C15.7622 26.7185 15.846 26.7038 15.9278 26.673C16.2911 26.5359 16.4744 26.1302 16.3373 25.7669L13.6698 18.6985C13.9966 18.7924 14.3412 18.8438 14.6978 18.8438H23.625V27.7707Z" fill="#E66F51" />
                                        <path d="M23.4844 1.40625C23.6693 1.40625 23.8507 1.33102 23.9814 1.20023C24.1123 1.06945 24.1875 0.888047 24.1875 0.703125C24.1875 0.518203 24.1123 0.336797 23.9814 0.206016C23.8507 0.0752344 23.6693 0 23.4844 0C23.2995 0 23.118 0.0752344 22.9873 0.206016C22.8564 0.336797 22.7812 0.518203 22.7812 0.703125C22.7812 0.888047 22.8564 1.06945 22.9873 1.20023C23.1181 1.33102 23.2995 1.40625 23.4844 1.40625Z" fill="#E66F51" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_69_2763">
                                            <rect height="36" width="36" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <h4 className="text-lg font-bold text-neutral-800">
                                    Languages Spoken
                                </h4>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-8">
                                {doctorData.language && doctorData.language.map((lang) => (
                                    <div
                                        key={lang}
                                        className="group relative flex items-center gap-2 bg-white border border-neutral-200 pl-4 pr-3 py-2 rounded-2xl text-sm font-semibold text-neutral-700 shadow-sm hover:border-brand/40 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand/60 group-hover:bg-brand transition-colors" />
                                        {lang}
                                        <button
                                            onClick={() => removeLanguage(lang)}
                                            className="ml-1 p-0.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Icon icon="solar:close-circle-bold" className="text-lg" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 bg-neutral-50 p-2 rounded-2xl border border-neutral-100">
                                <div className="flex-1">
                                    <select
                                        value={selectedLang}
                                        onChange={(e) => {
                                            setSelectedLang(e.target.value);
                                            if (e.target.value) addLanguage(e.target.value);
                                        }}
                                        className="w-full bg-transparent border-none focus:ring-0 text-neutral-700 font-medium cursor-pointer py-3 px-4"
                                    >
                                        <option value="">Select a language...</option>
                                        {indianLanguages.map((lang) => {
                                            const isAlreadySelected = doctorData.language?.includes(lang);
                                            return (
                                                <option
                                                    key={lang}
                                                    value={lang}
                                                    disabled={isAlreadySelected}
                                                    style={{ color: isAlreadySelected ? '#9CA3AF' : 'inherit' }}
                                                >
                                                    {lang}{isAlreadySelected ? ' ✓' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                            </div>

                        </div>


                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">

                            <div className="bg-amber-100 p-3 rounded-xl h-fit">
                                <Icon icon="solar:shield-warning-bold" className="text-2xl text-amber-600" />
                            </div>

                            <div>

                                <h5 className="font-bold text-amber-800">
                                    Private Information
                                </h5>

                                <p className="text-sm text-amber-700 mt-1">
                                    Your private contact details are managed by the admin panel and are not displayed publicly.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </MasterLayout>
    );
};

export default Profile;