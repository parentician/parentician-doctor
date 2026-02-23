import { useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import Modal from "../../components/Common/Modal";
import toast from "react-hot-toast";

const Appointments = () => {
    const [activeTab, setActiveTab] = useState("TODAY");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("VIEW"); // 'VIEW' or 'EDIT'
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [editData, setEditData] = useState({ status: "", notes: "" });

    const tabs = [
        { id: "TODAY", label: "Today" },
        { id: "UPCOMING", label: "Upcoming" },
        { id: "PAST", label: "Past" },
        { id: "CANCELLED", label: "Cancelled" },
        { id: "ALL", label: "All" },
    ];

    const dummyData = [
        { id: 1, date: "Feb 21, 2026", slot: "10:30 AM", fullName: "Riya Sharma", concern: "Child Nutrition consultation regarding picky eating habits", grandTotal: "₹1,200", status: "CONFIRMED" },
        { id: 2, date: "Feb 21, 2026", slot: "11:15 AM", fullName: "Arjun Mehra", concern: "Growth Milestone checkup for 18-month-old", grandTotal: "₹800", status: "PENDING" },
        { id: 3, date: "Feb 22, 2026", slot: "09:00 AM", fullName: "Sanya Gupta", concern: "Sleep Training session", grandTotal: "₹1,500", status: "CONFIRMED" },
        { id: 4, date: "Feb 20, 2026", slot: "04:30 PM", fullName: "Vikram Singh", concern: "Behavioral Issues in toddlers", grandTotal: "₹1,200", status: "COMPLETED" },
        { id: 5, date: "Feb 19, 2026", slot: "12:00 PM", fullName: "Priya Das", concern: "Speech delay concerns", grandTotal: "₹800", status: "CANCELLED" },
    ];

    const filteredData = dummyData.filter(appt => {
        const matchesSearch = appt.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === "ALL") return matchesSearch;
        if (activeTab === "TODAY") return matchesSearch && appt.date === "Feb 21, 2026";
        if (activeTab === "UPCOMING") return matchesSearch && appt.status === "CONFIRMED" && appt.date !== "Feb 21, 2026";
        if (activeTab === "PAST") return matchesSearch && appt.status === "COMPLETED";
        if (activeTab === "CANCELLED") return matchesSearch && appt.status === "CANCELLED";
        return matchesSearch;
    });

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
        setEditData({ status: appt.status, notes: appt.notes || "" });
        setModalType("EDIT");
        setIsModalOpen(true);
    };

    const handleUpdate = () => {
        // Mock update
        toast.success("Appointment updated successfully!");
        setIsModalOpen(false);
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
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
                            <Icon icon="solar:filter-bold" className="text-brand" />
                            <span className="text-sm font-semibold">Filter</span>
                        </button>
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
                                    <th className="px-6 py-4 font-bold">Amount</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredData.map((appt) => (
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
                                            <p className="text-sm font-bold text-neutral-800">{appt.grandTotal}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

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
                                <p className="text-sm text-neutral-500">#{selectedAppt.id} • Patient</p>
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
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">AMOUNT</p>
                                    <p className="font-bold text-neutral-800">{selectedAppt.grandTotal}</p>
                                </div>
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
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">UPDATE STATUS</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setEditData({ ...editData, status })}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${editData.status === status
                                                    ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20'
                                                    : 'bg-white border-neutral-200 text-neutral-500 hover:border-brand-light'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">INTERNAL NOTES</label>
                                    <textarea
                                        className="input-field min-h-[120px] resize-none"
                                        placeholder="Add private notes for this session..."
                                        value={editData.notes}
                                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
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
