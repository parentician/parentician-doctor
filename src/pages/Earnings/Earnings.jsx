import { useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import ReactApexChart from "react-apexcharts";
import toast from "react-hot-toast";

const Earnings = () => {
    const [filter, setFilter] = useState("THIS_MONTH");

    const stats = [
        { title: "Total Revenue", value: "₹2,45,800", trend: "+12.5%", icon: "solar:bank-note-bold", color: "text-green-500", bg: "bg-green-50" },
        { title: "Total Sessions", value: "324", trend: "+8.2%", icon: "solar:videocamera-record-bold", color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Average Rating", value: "4.8", trend: "+0.1", icon: "solar:star-bold", color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Patient Retential", value: "85%", trend: "+5.4%", icon: "solar:user-hand-up-bold", color: "text-brand", bg: "bg-brand-light" },
    ];

    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Figtree, sans-serif', sparkline: { enabled: false } },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
        colors: ['#E66F51'],
        xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { show: false } },
        grid: { show: false },
        dataLabels: { enabled: false },
        tooltip: { x: { show: false } }
    };

    const chartSeries = [{ name: 'Earnings', data: [31000, 40000, 28000, 51000, 42000, 109000, 100000, 95000] }];

    const transactions = [
        { id: "TXN12345", date: "Feb 21, 2026", patient: "Riya Sharma", type: "Consulation", amount: "₹1,200", status: "Paid" },
        { id: "TXN12346", date: "Feb 20, 2026", patient: "Arjun Mehra", type: "Follow-up", amount: "₹800", status: "Paid" },
        { id: "TXN12347", date: "Feb 19, 2026", patient: "Sanya Gupta", type: "Emergency", amount: "₹2,500", status: "Paid" },
        { id: "TXN12348", date: "Feb 18, 2026", patient: "Vikram Singh", type: "Consulation", amount: "₹1,200", status: "Refunded" },
    ];

    const handleExport = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Generating Report...',
                success: 'Report downloaded successfully!',
                error: 'Failed to generate report.',
            }
        );
    };

    return (
        <MasterLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-800">Earnings & Reports</h2>
                        <p className="text-sm text-neutral-500">Track your financial performance and patient reviews</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                    >
                        <Icon icon="solar:file-download-bold" className="text-xl" />
                        <span>Download Report</span>
                    </button>
                </div>

                {/* Multi-Stat Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="card-container p-6 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                    <Icon icon={stat.icon} className="text-2xl" />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-neutral-500 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-extrabold mt-1 text-neutral-800">{stat.value}</h3>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icon icon={stat.icon} className="text-8xl" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 card-container p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-lg text-neutral-800">Revenue Growth</h3>
                            <select
                                className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="THIS_MONTH">This Month</option>
                                <option value="LAST_6_MONTHS">Last 6 Months</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </div>
                        <div className="h-[300px]">
                            <ReactApexChart options={chartOptions} series={chartSeries} type="area" height="100%" />
                        </div>
                    </div>

                    {/* Quick Actions / Summary */}
                    <div className="space-y-6">
                        <div className="card-container p-6 bg-neutral-900 text-white border-0">
                            <h4 className="font-bold mb-4">Payout Balance</h4>
                            <p className="text-3xl font-black text-brand">₹18,450.00</p>
                            <p className="text-xs text-neutral-400 mt-2">Scheduled for: Feb 28, 2026</p>
                            <button className="w-full mt-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-colors">
                                Request Instant Payout
                            </button>
                        </div>

                        <div className="card-container p-6 border-brand border-dashed">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-brand-light p-2 rounded-lg">
                                    <Icon icon="solar:gift-bold" className="text-brand" />
                                </div>
                                <h4 className="font-bold text-sm">Referral Program</h4>
                            </div>
                            <p className="text-xs text-neutral-500 leading-relaxed">Refer another specialist to Parentician and earn ₹1,000 for every successfully onboarded doctor.</p>
                            <button className="mt-4 text-brand text-xs font-bold hover:underline">Refer Now $\rightarrow$</button>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="card-container">
                    <div className="p-6 border-b border-neutral-100">
                        <h3 className="font-bold text-lg text-neutral-800">Transaction History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase">
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-neutral-800">{txn.id}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">{txn.date}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-neutral-700">{txn.patient}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">{txn.type}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-neutral-800">{txn.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${txn.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default Earnings;
