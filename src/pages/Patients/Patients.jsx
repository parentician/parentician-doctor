import { useEffect, useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import { get } from "../../helper/api_helper";
import toast from "react-hot-toast";

const Patients = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patients, setPatients] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await get("/api/doctor-portal/patients");
            if (response.status) {
                setPatients(response.data);
            }
        } catch (error) {
            toast.error("Error fetching patients data");
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientHistory = async (userId) => {
        setHistoryLoading(true);
        try {
            const response = await get(`/api/doctor-portal/patient-history/${userId}`);
            if (response.status) {
                setHistory(response.data.history);
                // The API also returns patient summary in response.data.patient if needed
            }
        } catch (error) {
            toast.error("Error fetching consultation history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        fetchPatientHistory(patient.id);
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

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
                        <div className="card-container">
                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="spinner-border text-brand" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[600px]">
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
                                            {currentPatients.map((patient) => (
                                                <tr
                                                    key={patient.id}
                                                    className={`hover:bg-neutral-50 transition-colors cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-brand-light/20' : ''}`}
                                                    onClick={() => handlePatientClick(patient)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold">
                                                                {patient.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-neutral-800">{patient.name}</p>
                                                                <p className="text-[10px] text-neutral-500 uppercase font-black">{patient.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-neutral-600 text-sm">{patient.totalSessions}</td>
                                                    <td className="px-6 py-4 text-neutral-500 text-sm">{patient.lastConsult}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${patient.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-600'}`}>
                                                            {patient.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-brand text-xs font-bold hover:underline">View History</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredPatients.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-neutral-400 italic">No patients found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {filteredPatients.length > 0 && (
                                <div className="px-6 py-4 bg-white border-t border-neutral-100 flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all disabled:opacity-50"
                                        >
                                            <Icon icon="solar:alt-arrow-left-linear" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-all disabled:opacity-50"
                                        >
                                            <Icon icon="solar:alt-arrow-right-linear" />
                                        </button>
                                    </div>
                                </div>
                            )}
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
                                    <h3 className="text-xl font-bold text-neutral-800 break-words">{selectedPatient.name}</h3>
                                    <p className="text-sm text-neutral-500 break-words">{selectedPatient.email}</p>
                                </div>

                                <div className="py-6 space-y-6">
                                    <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-tighter">Consultation History</h4>

                                    {historyLoading ? (
                                        <div className="py-8 text-center">
                                            <div className="spinner-border spinner-border-sm text-brand" role="status"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {history.map(item => (
                                                <div key={item.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-brand-light transition-colors group">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-bold text-neutral-400 capitalize">{item.date}</span>
                                                        <span className={`text-[9px] font-black uppercase ${item.status === 'COMPLETED' ? 'text-green-500' :
                                                            item.status === 'CANCELLED' ? 'text-red-500' : 'text-orange-500'
                                                            }`}>{item.status}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-neutral-800 group-hover:text-brand transition-colors break-words whitespace-pre-line">{item.concern || "No concern provided"}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                                                            <Icon icon="solar:clock-circle-linear" /> {item.slot}
                                                        </p>

                                                    </div>
                                                </div>
                                            ))}
                                            {history.length === 0 && (
                                                <p className="text-center text-xs text-neutral-400 py-4 italic">No consultation records found</p>
                                            )}
                                        </div>
                                    )}

                                    {/* <button className="w-full py-3 border-2 border-dashed border-neutral-200 text-neutral-400 rounded-xl text-xs font-bold hover:border-brand hover:text-brand transition-all">
                                        View All Records
                                    </button> */}
                                </div>
                            </div>
                        ) : (
                            <div className="card-container p-12 text-center h-full flex-col items-center justify-center opacity-50 hidden lg:flex min-h-[300px]">
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
