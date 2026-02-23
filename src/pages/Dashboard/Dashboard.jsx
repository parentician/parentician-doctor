import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import ReactApexChart from "react-apexcharts";

const Dashboard = () => {
    const stats = [
        { title: "Today's Sessions", value: "8", icon: "solar:videocamera-record-bold", color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Pending Approvals", value: "12", icon: "solar:clock-circle-bold", color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Total Patients", value: "1,248", icon: "solar:users-group-rounded-bold", color: "text-brand", bg: "bg-brand-light" },
        { title: "This Month Earnings", value: "₹45,200", icon: "solar:wallet-money-bold", color: "text-green-500", bg: "bg-green-50" },
    ];

    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'Figtree, sans-serif'
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '40%',
            }
        },
        dataLabels: { enabled: false },
        colors: ['#E66F51'],
        xaxis: {
            categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (val) => `₹${val / 1000}k`
            }
        },
        grid: {
            borderColor: '#f1f1f1',
            strokeDashArray: 4,
        }
    };

    const chartSeries = [{
        name: 'Earnings',
        data: [32000, 41000, 38000, 52000, 48000, 45200]
    }];

    const appointments = [
        { id: 1, patient: "Riya Sharma", time: "10:30 AM", concern: "Child Nutrition", status: "Confirmed" },
        { id: 2, patient: "Arjun Mehra", time: "11:15 AM", concern: "Growth Milestone", status: "Pending" },
        { id: 3, patient: "Sanya Gupta", time: "12:00 PM", concern: "Sleep Training", status: "Confirmed" },
        { id: 4, patient: "Vikram Singh", time: "02:30 PM", concern: "Behavioral Issues", status: "Confirmed" },
    ];

    return (
        <MasterLayout>
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="card-container p-6 flex items-center justify-between">
                            <div>
                                <p className="text-neutral-500 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <Icon icon={stat.icon} className="text-2xl" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Today's Appointments */}
                    <div className="lg:col-span-2 card-container">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Today's Appointments</h3>
                            <button className="text-brand text-sm font-semibold hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-500 text-sm">
                                        <th className="px-6 py-4 font-semibold">Patient Name</th>
                                        <th className="px-6 py-4 font-semibold">Time Slot</th>
                                        <th className="px-6 py-4 font-semibold">Concern</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {appointments.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-neutral-800">{appt.patient}</td>
                                            <td className="px-6 py-4 text-neutral-600">{appt.time}</td>
                                            <td className="px-6 py-4 text-neutral-600">{appt.concern}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-all">
                                                    <Icon icon="solar:eye-bold" className="text-neutral-400 hover:text-brand" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Earnings Chart */}
                    <div className="card-container p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg">Earnings (6mo)</h3>
                            <Icon icon="solar:info-circle-bold" className="text-neutral-400 cursor-pointer" />
                        </div>
                        <div id="earnings-chart">
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="bar"
                                height={300}
                            />
                        </div>
                        <div className="mt-6 p-4 bg-brand-light rounded-xl border border-brand/10">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-brand">Projected Earnings</p>
                                <span className="text-xs text-neutral-500 font-medium">Feb 2026</span>
                            </div>
                            <h4 className="text-lg font-bold text-neutral-800 mt-1">₹58,400</h4>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default Dashboard;
