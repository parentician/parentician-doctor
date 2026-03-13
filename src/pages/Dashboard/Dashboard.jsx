import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import ReactApexChart from "react-apexcharts";
import { useEffect, useState } from "react";
import { get } from "../../helper/api_helper";
import toast from "react-hot-toast";

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await get("/api/doctor-portal/dashboard-stats");
            if (response.status) {
                setData(response.data);
            }
        } catch (error) {
            toast.error("Error fetching dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <MasterLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-neutral-500 font-medium">Loading your dashboard...</p>
                </div>
            </MasterLayout>
        );
    }

    const { stats: apiStats, chartData, todayAppointments, pendingAppointments } = data;

    const stats = [
        { title: "Today's Sessions", value: apiStats.todaySessions.toString(), icon: "solar:videocamera-record-bold", color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Pending Approvals", value: apiStats.pendingApprovals.toString(), icon: "solar:clock-circle-bold", color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Total Patients", value: apiStats.totalPatients.toString(), icon: "solar:users-group-rounded-bold", color: "text-brand", bg: "bg-brand-light" },
        { title: "This Month Earnings", value: `₹${apiStats.thisMonthEarnings.toLocaleString()}`, icon: "solar:wallet-money-bold", color: "text-green-500", bg: "bg-green-50" },
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
            categories: chartData.map(d => d.month),
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (val) => `₹${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`
            }
        },
        grid: {
            borderColor: '#f1f1f1',
            strokeDashArray: 4,
        }
    };

    const chartSeries = [{
        name: 'Earnings',
        data: chartData.map(d => d.earnings)
    }];

    const currentYear = new Date().getFullYear();
    const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date());

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

                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-500 text-sm">
                                        <th className="px-6 py-4 font-semibold">Patient Name</th>
                                        <th className="px-6 py-4 font-semibold">Time Slot</th>
                                        <th className="px-6 py-4 font-semibold">Concern</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {todayAppointments.length > 0 ? todayAppointments.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-neutral-800">{appt.fullName}</td>
                                            <td className="px-6 py-4 text-neutral-600">{appt.slot}</td>
                                            <td className="px-6 py-4 text-neutral-600">{appt.concern}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' :
                                                    appt.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                                        appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-neutral-100 text-neutral-600'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </td>

                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-neutral-400 text-sm">
                                                No sessions scheduled for today
                                            </td>
                                        </tr>
                                    )}
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
                                <span className="text-xs text-neutral-500 font-medium">{currentMonthName} {currentYear}</span>
                            </div>
                            <h4 className="text-lg font-bold text-neutral-800 mt-1">₹{apiStats.thisMonthEarnings.toLocaleString()}</h4>
                        </div>
                    </div>

                    {/* Pending Appointments */}
                    <div className="lg:col-span-2 card-container">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Pending Appointments</h3>

                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-500 text-sm">
                                        <th className="px-6 py-4 font-semibold">Patient Name</th>
                                        <th className="px-6 py-4 font-semibold">Time Slot</th>
                                        <th className="px-6 py-4 font-semibold">Concern</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>

                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {pendingAppointments.length > 0 ? pendingAppointments.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-neutral-800">{appt.fullName}</td>
                                            <td className="px-6 py-4 text-neutral-600">{appt.slot}</td>
                                            <td className="px-6 py-4 text-neutral-600">{appt.concern}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600`}>
                                                    {appt.status}
                                                </span>
                                            </td>

                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-neutral-400 text-sm">
                                                No pending appointments
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default Dashboard;
