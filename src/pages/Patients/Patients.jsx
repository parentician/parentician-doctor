import { useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";

const Patients = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);

    const patients = [
        { id: "P101", name: "Riya Sharma", age: "28", email: "riya@example.com", totalSessions: 5, lastConsultation: "Feb 21, 2026", status: "Active" },
        { id: "P102", name: "Arjun Mehra", age: "32", email: "arjun@example.com", totalSessions: 2, lastConsultation: "Feb 20, 2026", status: "New" },
        { id: "P103", name: "Sanya Gupta", age: "25", email: "sanya@example.com", totalSessions: 8, lastConsultation: "Jan 15, 2026", status: "Regular" },
        { id: "P104", name: "Vikram Singh", age: "40", email: "vikram@example.com", totalSessions: 1, lastConsultation: "Feb 18, 2026", status: "Active" },
    ];

    const consultationHistory = [
        { id: 1, date: "Feb 21, 2026", time: "10:30 AM", concern: "Child Nutrition", status: "Completed" },
        { id: 2, date: "Jan 10, 2026", time: "02:00 PM", concern: "Growth Milestone", status: "Completed" },
        { id: 3, date: "Dec 05, 2025", time: "11:00 AM", concern: "Picky Eating", status: "Completed" },
    ];

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MasterLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-800">Patients Directory</h2>
                        <p className="text-sm text-neutral-500">Manage your patient base and view their consultation history</p>
                    </div>
                    <div className="relative">
                        <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-full md:w-80 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Patient List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="card-container overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase">
                                        <th className="px-6 py-4">Patient</th>
                                        <th className="px-6 py-4">Total Sessions</th>
                                        <th className="px-6 py-4">Last Consult</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient.id} className={`hover:bg-neutral-50 transition-colors cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-brand-light/20' : ''}`} onClick={() => setSelectedPatient(patient)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold">
                                                        {patient.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-neutral-800">{patient.name}</p>
                                                        <p className="text-[10px] text-neutral-500 uppercase font-black">{patient.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-neutral-600 text-sm">{patient.totalSessions}</td>
                                            <td className="px-6 py-4 text-neutral-500 text-sm">{patient.lastConsultation}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${patient.status === 'New' ? 'bg-blue-100 text-blue-600' :
                                                        patient.status === 'Regular' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {patient.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-brand text-xs font-bold hover:underline">View History</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Patient Detail Panel */}
                    <div className="space-y-6">
                        {selectedPatient ? (
                            <div className="card-container p-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center pb-6 border-b border-neutral-100">
                                    <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center text-brand font-black text-2xl mx-auto mb-4">
                                        {selectedPatient.name.charAt(0)}
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-800">{selectedPatient.name}</h3>
                                    <p className="text-sm text-neutral-500">{selectedPatient.email}</p>
                                    <p className="text-xs text-neutral-400 mt-1">Age: {selectedPatient.age} years</p>
                                </div>

                                <div className="py-6 space-y-6">
                                    <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-tighter">Consultation History</h4>
                                    <div className="space-y-3">
                                        {consultationHistory.map(history => (
                                            <div key={history.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-brand-light transition-colors group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-neutral-400 capitalize">{history.date}</span>
                                                    <span className="text-[9px] font-black uppercase text-green-500">{history.status}</span>
                                                </div>
                                                <p className="text-sm font-bold text-neutral-800 group-hover:text-brand transition-colors">{history.concern}</p>
                                                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                                    <Icon icon="solar:clock-circle-linear" /> {history.time}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full py-3 border-2 border-dashed border-neutral-200 text-neutral-400 rounded-xl text-xs font-bold hover:border-brand hover:text-brand transition-all">
                                        View All Records
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card-container p-12 text-center h-[500px] flex flex-col items-center justify-center opacity-50">
                                <Icon icon="solar:user-rounded-broken" className="text-6xl text-neutral-200 mb-4" />
                                <h4 className="font-bold text-neutral-400 uppercase tracking-widest text-xs">Selection Required</h4>
                                <p className="text-sm text-neutral-300 mt-2">Select a patient from the list <br /> to view their details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default Patients;
