import { useEffect, useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";
import { get, put, post } from "../../helper/api_helper";

const IMG_URL = (import.meta.env.VITE_APP_AUTHDOMAIN || "http://localhost:5000") + "/api";

const Appointments = () => {
    const [activeTab, setActiveTab] = useState("TODAY");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("VIEW"); // 'VIEW' or 'EDIT'
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [editData, setEditData] = useState({ status: "", internalNotes: "", cancelReason: "" });
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
    const [followUpStep, setFollowUpStep] = useState("CONFIRM"); // "CONFIRM" or "FORM"
    const [followUpData, setFollowUpData] = useState({ date: "", reason: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const tabs = [
        { id: "TODAY", label: "Today" },
        { id: "UPCOMING", label: "Upcoming" },
        { id: "PAST", label: "Past" },
        { id: "CANCELLED", label: "Cancelled" },
        { id: "ALL", label: "All" },
    ];

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await get("/api/doctor-portal/appointments");
            if (response.status) {
                setAppointments(response.data);
            } else {
                toast.error(response.message || "Failed to fetch appointments");
            }
        } catch (error) {
            toast.error("Error fetching appointments");
        } finally {
            setLoading(false);
        }
    };

    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const filteredData = appointments.filter(appt => {
        const matchesSearch = appt.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

        const apptDateObj = parseDate(appt.date);
        const todayObj = new Date();
        todayObj.setHours(0, 0, 0, 0);

        const isToday = apptDateObj.getTime() === todayObj.getTime();
        const isFuture = apptDateObj.getTime() > todayObj.getTime();
        const isPast = apptDateObj.getTime() < todayObj.getTime();

        if (activeTab === "ALL") return matchesSearch;
        if (activeTab === "TODAY") return matchesSearch && isToday;
        if (activeTab === "UPCOMING") return matchesSearch && (appt.status === "CONFIRMED" || appt.status === "PENDING") && isFuture;
        if (activeTab === "PAST") return matchesSearch && (appt.status === "COMPLETED" || isPast);
        if (activeTab === "CANCELLED") return matchesSearch && appt.status === "CANCELLED";
        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const getStatusStyle = (status) => {
        switch (status) {
            case "CONFIRMED": return "bg-green-100 text-green-600";
            case "PENDING": return "bg-amber-100 text-amber-600";
            case "COMPLETED": return "bg-blue-100 text-blue-600";
            case "CANCELLED": return "bg-red-100 text-red-600";
            default: return "bg-neutral-100 text-neutral-600";
        }
    };

    const handleView = (appt) => {
        setSelectedAppt(appt);
        setModalType("VIEW");
        setIsModalOpen(true);
    };

    const handleEdit = (appt) => {
        setSelectedAppt(appt);
        setEditData({
            status: appt.status,
            internalNotes: appt.internalNotes || "",
            cancelReason: appt.reason || ""
        });
        setModalType("EDIT");
        setIsModalOpen(true);
    };

    const handleUpdate = async () => {
        // Validation: If confirmed -> cancelled, reason is required
        if (selectedAppt.status === "CONFIRMED" && editData.status === "CANCELLED" && !editData.cancelReason?.trim()) {
            return toast.error("Please provide a cancellation reason");
        }

        try {
            const response = await put("/api/doctor-portal/edit-appointment", {
                appointmentId: selectedAppt.id,
                status: editData.status,
                internalNotes: editData.internalNotes,
                cancelReason: editData.cancelReason
            });

            if (response.status) {
                toast.success(response.message || "Appointment updated successfully!");
                setIsModalOpen(false);
                fetchAppointments(); // Refresh list
            } else {
                toast.error(response.message || "Failed to update appointment");
            }
        } catch (error) {
            toast.error("Error updating appointment");
            console.error(error);
        }
    };
    const handleFollowUpClick = (appt) => {
        setSelectedAppt(appt);
        setFollowUpStep("CONFIRM");
        setFollowUpData({ date: "", reason: "" });
        setIsFollowUpOpen(true);
    };

    const handleFollowUpSubmit = async () => {
        if (!followUpData.date || !followUpData.reason) {
            return toast.error("Please fill in all fields");
        }

        try {
            const response = await post("/api/doctor-portal/schedule-follow-up", {
                appointmentId: selectedAppt.id,
                date: followUpData.date,
                reason: followUpData.reason
            });

            if (response.status) {
                toast.success(response.message || "Follow-up scheduled successfully!");
                setIsFollowUpOpen(false);
            } else {
                toast.error(response.message || "Failed to schedule follow-up");
            }
        } catch (error) {
            toast.error("Error scheduling follow-up");
            console.error(error);
        }
    };

    return (
        <MasterLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-neutral-800">Appointments</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search patient..."
                                className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-full md:w-64 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-200 gap-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? "text-brand" : "text-neutral-500 hover:text-neutral-700"
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="card-container overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold"># ID</th>
                                    <th className="px-6 py-4 font-bold">Date & Slot</th>
                                    <th className="px-6 py-4 font-bold">Patient Name</th>
                                    <th className="px-6 py-4 font-bold">Concern</th>
                                    <th className="px-6 py-4 font-bold">Doctor Fees</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {currentItems.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-neutral-50 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-medium text-neutral-400">#{appt.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-neutral-800">{appt.date}</p>
                                            <p className="text-xs text-neutral-500">{appt.slot}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-xs">
                                                    {appt.fullName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-neutral-700">{appt.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-neutral-600 truncate">{appt.concern}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-neutral-800">₹{appt.doctor_charges || appt.grandTotal}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(appt)}
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-all text-neutral-400 hover:text-brand"
                                                    title="View Details"
                                                >
                                                    <Icon icon="solar:eye-bold" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(appt)}
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-all text-neutral-400 hover:text-brand"
                                                    title="Edit Status"
                                                >
                                                    <Icon icon="solar:pen-new-square-bold" />
                                                </button>
                                                <button
                                                    onClick={() => handleFollowUpClick(appt)}
                                                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-all text-neutral-400 hover:text-amber-500"
                                                    title="Schedule Follow-up"
                                                >
                                                    <Icon icon="solar:calendar-add-bold" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredData.length > 0 && (
                        <div className="px-6 py-4 bg-white border-t border-neutral-100 flex items-center justify-between">
                            <div className="text-sm text-neutral-500">
                                Showing <span className="font-bold text-neutral-800">{indexOfFirstItem + 1}</span> to <span className="font-bold text-neutral-800">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="font-bold text-neutral-800">{filteredData.length}</span> appointments
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Icon icon="solar:alt-arrow-left-linear" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    // Logic to show early, mid, late pages if many exist
                                    if (totalPages <= 7 || (page === 1 || page === totalPages) || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === page ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-neutral-500 hover:bg-neutral-50 border border-transparent"
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="text-neutral-400">...</span>;
                                    }
                                    return null;
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Icon icon="solar:alt-arrow-right-linear" />
                                </button>
                            </div>
                        </div>
                    )}

                    {filteredData.length === 0 && (
                        <div className="p-12 text-center h-[400px] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                                <Icon icon="solar:calendar-broken" className="text-4xl text-neutral-300" />
                            </div>
                            <h4 className="font-bold text-neutral-800">No appointments found</h4>
                            <p className="text-neutral-500 text-sm mt-1">Try adjusting your filters or search query</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Appointment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalType === "VIEW" ? "Appointment Details" : "Edit Appointment"}
                maxWidth="max-w-lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-all"
                        >
                            {modalType === "VIEW" ? "Close" : "Cancel"}
                        </button>
                        {modalType === "EDIT" && (
                            <button
                                onClick={handleUpdate}
                                className="btn-primary px-8"
                            >
                                Save Changes
                            </button>
                        )}
                    </div>
                }
            >
                {selectedAppt && (
                    <div className="space-y-6">
                        {/* Patient info header */}
                        <div className="flex items-center gap-4 p-4 bg-brand-light/20 rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center text-2xl font-black">
                                {selectedAppt.fullName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-neutral-800">{selectedAppt.fullName}</h4>
                                <p className="text-sm text-neutral-500">• Patient</p>
                            </div>
                        </div>

                        {modalType === "VIEW" ? (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">DATE</p>
                                    <p className="font-bold text-neutral-700">{selectedAppt.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">SLOT</p>
                                    <p className="font-bold text-neutral-700">{selectedAppt.slot}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Doctor Fees</p>
                                    <p className="font-bold text-neutral-800">₹{selectedAppt.doctor_charges || selectedAppt.grandTotal}</p>
                                </div>
                                {selectedAppt.report && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Medical Report</p>
                                        <a
                                            href={`${IMG_URL}/get-images/${selectedAppt.report}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-bold text-[#E66F51] hover:underline flex items-center gap-1"
                                        >
                                            View Report
                                            <Icon icon="solar:link-bold" fontSize={14} />
                                        </a>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">STATUS</p>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(selectedAppt.status)}`}>
                                        {selectedAppt.status}
                                    </span>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">CONCERN</p>
                                    <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                        {selectedAppt.concern}
                                    </p>
                                </div>
                                {selectedAppt.internalNotes && (
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">DOCTOR'S PERSONAL NOTE <span className="text-[8px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-full lowercase font-bold italic tracking-normal">Only visible to you</span></p>
                                        <p className="text-sm text-neutral-600 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100 italic">
                                            {selectedAppt.internalNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">UPDATE STATUS</label>
                                    <select
                                        className="input-field py-3 font-bold"
                                        value={editData.status}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                        disabled={selectedAppt.status === "CANCELLED" || selectedAppt.status === "COMPLETED"}
                                    >
                                        {selectedAppt.status === "PENDING" && (
                                            <>
                                                <option value="PENDING">PENDING</option>
                                                <option value="CONFIRMED">CONFIRMED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </>
                                        )}
                                        {selectedAppt.status === "CONFIRMED" && (
                                            <>
                                                <option value="CONFIRMED">CONFIRMED</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </>
                                        )}
                                        {selectedAppt.status === "CANCELLED" && (
                                            <option value="CANCELLED">CANCELLED</option>
                                        )}
                                        {selectedAppt.status === "COMPLETED" && (
                                            <option value="COMPLETED">COMPLETED</option>
                                        )}
                                    </select>
                                </div>

                                {editData.status === "CANCELLED" && selectedAppt.status === "CONFIRMED" && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                                CANCELLATION REASON
                                                <span className="text-red-500 text-xs">* Required</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setEditData({ ...editData, cancelReason: "Emergency Cancellation" })}
                                                className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors"
                                            >
                                                Emergency Cancel
                                            </button>
                                        </div>
                                        <textarea
                                            className="input-field min-h-[100px] resize-none"
                                            placeholder="Why is this appointment being cancelled?"
                                            value={editData.cancelReason}
                                            onChange={(e) => setEditData({ ...editData, cancelReason: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">DOCTOR'S PERSONAL NOTE <span className="text-[8px] px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full lowercase font-bold italic tracking-normal">Only visible to you</span></label>
                                    <textarea
                                        className="input-field min-h-[120px] resize-none"
                                        placeholder="Add private notes for your reference only..."
                                        value={editData.internalNotes}
                                        onChange={(e) => setEditData({ ...editData, internalNotes: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Follow-up Modal */}
            <Modal
                isOpen={isFollowUpOpen}
                onClose={() => setIsFollowUpOpen(false)}
                title={followUpStep === "CONFIRM" ? "Schedule Follow-up" : "Follow-up Details"}
                maxWidth="max-w-md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsFollowUpOpen(false)}
                            className="px-6 py-2 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-all"
                        >
                            Cancel
                        </button>
                        {followUpStep === "CONFIRM" ? (
                            <button
                                onClick={() => setFollowUpStep("FORM")}
                                className="btn-primary px-8"
                            >
                                Yes, Schedule
                            </button>
                        ) : (
                            <button
                                onClick={handleFollowUpSubmit}
                                className="btn-primary px-8"
                            >
                                Confirm Follow-up
                            </button>
                        )}
                    </div>
                }
            >
                {selectedAppt && (
                    <div className="space-y-6">
                        {followUpStep === "CONFIRM" ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon icon="solar:calendar-add-bold" className="text-3xl" />
                                </div>
                                <h4 className="text-xl font-bold text-neutral-800">Confirm Follow-up?</h4>
                                <p className="text-neutral-500 mt-2">
                                    Do you want to schedule a follow-up session for <strong>{selectedAppt.fullName}</strong>?
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">TARGET FOLLOW-UP DATE</label>
                                    <input
                                        type="date"
                                        className="input-field py-3"
                                        value={followUpData.date}
                                        onChange={(e) => setFollowUpData({ ...followUpData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">FOLLOW-UP REASON / GOAL</label>
                                    <textarea
                                        className="input-field min-h-[100px] resize-none"
                                        placeholder="What is the objective for the next session?"
                                        value={followUpData.reason}
                                        onChange={(e) => setFollowUpData({ ...followUpData, reason: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </MasterLayout>
    );
};

export default Appointments;
