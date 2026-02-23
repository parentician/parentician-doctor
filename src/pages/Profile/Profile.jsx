import { useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [doctorData, setDoctorData] = useState({
        doctor_name: "Dr. Sandeep Gupta",
        degree: "MD, Pediatrics",
        specialist: "Pediatrician",
        registration_no: "REG-2024-8892",
        experience: "12 Years",
        gender: "Male",
        location: "Mumbai, India",
        bio: "Dedicated pediatrician with over 12 years of experience in child healthcare. Specialized in neonatal care and developmental pediatrics.",
        languages: ["English", "Hindi", "Marathi"],
        profile_image: "doctor_img.jpg",
        google_calendar_connected: true
    });

    const [editableBio, setEditableBio] = useState(doctorData.bio);
    const [newLanguage, setNewLanguage] = useState("");

    const handleUpdateProfile = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setDoctorData({ ...doctorData, bio: editableBio });
            toast.success("Profile updated successfully!");
            setLoading(false);
        }, 800);
    };

    const removeLanguage = (lang) => {
        setDoctorData({
            ...doctorData,
            languages: doctorData.languages.filter(l => l !== lang)
        });
    };

    const addLanguage = () => {
        if (newLanguage && !doctorData.languages.includes(newLanguage)) {
            setDoctorData({
                ...doctorData,
                languages: [...doctorData.languages, newLanguage]
            });
            setNewLanguage("");
        }
    };

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
                        {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Icon icon="solar:diskette-bold" />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image & Basic Info */}
                    <div className="space-y-6">
                        <div className="card-container p-6 text-center">
                            <div className="relative inline-block">
                                <img
                                    src={doctorData.profile_image}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full border-4 border-brand-light mx-auto object-cover"
                                />
                                <button className="absolute bottom-0 right-0 p-2 bg-brand text-white rounded-full shadow-lg hover:bg-brand-dark transition-colors">
                                    <Icon icon="solar:camera-bold" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold mt-4">{doctorData.doctor_name}</h3>
                            <p className="text-neutral-500 text-sm">{doctorData.degree}</p>

                            <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${doctorData.google_calendar_connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium text-neutral-600">
                                    Google Calendar: {doctorData.google_calendar_connected ? "Connected" : "Disconnected"}
                                </span>
                            </div>
                        </div>

                        <div className="card-container p-6 space-y-4">
                            <h4 className="font-bold text-neutral-800 border-b border-neutral-100 pb-3">Administrative Details</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Reg. No</span>
                                    <span className="font-bold text-neutral-800">{doctorData.registration_no}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Specialty</span>
                                    <span className="font-bold text-neutral-800">{doctorData.specialist}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Experience</span>
                                    <span className="font-bold text-neutral-800">{doctorData.experience}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Location</span>
                                    <span className="font-bold text-neutral-800">{doctorData.location}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-neutral-400 italic mt-4">
                                * To change administrative details, please contact system admin.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Editable Professional Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card-container p-8">
                            <h4 className="text-lg font-bold text-neutral-800 mb-6">Professional Bio</h4>
                            <textarea
                                className="input-field min-h-[160px] resize-none leading-relaxed"
                                placeholder="Write your professional bio here..."
                                value={editableBio}
                                onChange={(e) => setEditableBio(e.target.value)}
                            />
                            <p className="text-xs text-neutral-400 mt-2">
                                This bio will be visible to patients when they book a session with you.
                            </p>
                        </div>

                        <div className="card-container p-8">
                            <h4 className="text-lg font-bold text-neutral-800 mb-6">Languages Spoken</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {doctorData.languages.map(lang => (
                                    <span key={lang} className="bg-brand-light text-brand px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                        {lang}
                                        <Icon
                                            icon="solar:close-circle-bold"
                                            className="cursor-pointer hover:text-brand-dark"
                                            onClick={() => removeLanguage(lang)}
                                        />
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Add another language (e.g. Spanish)"
                                    value={newLanguage}
                                    onChange={(e) => setNewLanguage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                                />
                                <button
                                    onClick={addLanguage}
                                    className="px-6 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
                            <div className="bg-amber-100 p-3 rounded-xl h-fit">
                                <Icon icon="solar:shield-warning-bold" className="text-2xl text-amber-600" />
                            </div>
                            <div>
                                <h5 className="font-bold text-amber-800">Private Information</h5>
                                <p className="text-sm text-amber-700 mt-1">
                                    Your private contact details (Email, Phone) are managed by the admin panel and are not displayed publicly to patients.
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
