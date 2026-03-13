import { useEffect, useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import ReactApexChart from "react-apexcharts";
import toast from "react-hot-toast";
import Modal from "../../components/Common/Modal";
import { get, post } from "../../helper/api_helper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Earnings = () => {

    const [report, setReport] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("SELECT_MONTH");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutData, setPayoutData] = useState({
        bankName: "",
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        upiId: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, startDate, endDate, selectedYear]);

    const loadData = async () => {
        setLoading(true);
        await fetchEarningsReport();
        await fetchTransactions();
        setLoading(false);
    };

    const fetchEarningsReport = async () => {
        try {
            const response = await get("/api/doctor-portal/earnings-report");

            if (response.status) {
                setReport(response.data);
            }

        } catch (error) {
            console.error("Failed to load earnings report:", error);
            const errorMessage = error.response?.data?.message || "Failed to load earnings report";
            toast.error(errorMessage);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await get("/api/doctor-portal/transaction-history");

            if (response.status) {
                setTransactions(response.data);
            }

        } catch (error) {
            console.error("Failed to load transactions:", error);
            const errorMessage = error.response?.data?.message || "Failed to load transactions";
            toast.error(errorMessage);
        }
    };

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

    const stats = [
        {
            title: "Total Revenue",
            value: `₹${report?.totalRevenue?.toLocaleString() || 0}`,
            trend: "+0%",
            icon: "solar:wallet-money-bold",
            color: "text-green-500",
            bg: "bg-green-50"
        },
        {
            title: "Total Sessions",
            value: report?.totalSessions || 0,
            trend: "+0%",
            icon: "solar:videocamera-record-bold",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "This Month Earnings",
            value: `₹${report?.monthlyRevenue?.toLocaleString() || 0}`,
            trend: "+0%",
            icon: "solar:card-2-bold",
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        {
            title: "This Month Sessions",
            value: `${report?.monthlySessions || 0}`,
            trend: "+0%",
            icon: "solar:users-group-rounded-bold",
            color: "text-brand",
            bg: "bg-brand-light"
        }
    ];

    const chartOptions = {
        chart: {
            type: "area",
            toolbar: { show: false },
            fontFamily: "Figtree, sans-serif"
        },
        stroke: {
            curve: "smooth",
            width: 3
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100]
            }
        },
        colors: ["#E66F51"],
        xaxis: {
            categories:
                report?.revenueGrowth?.map((r) =>
                    new Date(r.month).toLocaleString("default", { month: "short" })
                ) || [],
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { show: false }
        },
        grid: { show: false },
        dataLabels: { enabled: false },
        tooltip: { x: { show: false } }
    };

    const chartSeries = [
        {
            name: "Revenue",
            data: report?.revenueGrowth?.map((r) => Number(r.revenue)) || []
        }
    ];

    const handleExport = () => {
        try {
            const doc = new jsPDF("p", "mm", "a4");
            const today = new Date().toLocaleDateString();

            /* HEADER */
            doc.setFillColor(230, 111, 81);
            doc.rect(0, 0, 210, 8, "F");

            doc.setFontSize(20);
            doc.setTextColor(230, 111, 81);
            doc.text("Parentician", 14, 18);

            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text("Parenting Smartified", 14, 23);

            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text("FINANCIAL LEDGER REPORT", 210 - 14, 18, { align: "right" });

            doc.setFontSize(9);
            doc.text(`Date: ${today}`, 210 - 14, 23, { align: "right" });

            /* SUMMARY BOX */
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(14, 30, 182, 22, 3, 3, "F");

            doc.setFontSize(10);
            doc.setTextColor(60);
            doc.text(`Category: All`, 20, 40);
            doc.text(`Affiliate: All Transactions`, 20, 46);
            doc.text(`Period: All Time`, 110, 40);
            doc.text(`Total Records: ${transactions.length}`, 110, 46);

            /* TABLE */
            const tableData = transactions.map((txn, index) => [
                index + 1,
                txn.id.slice(0, 8),
                new Date(txn.createdAt).toLocaleDateString(),
                txn.paymentMethod,
                txn.requestedAmount,
                txn.paidAmount,
                txn.status,
            ]);

            autoTable(doc, {
                startY: 60,
                margin: { left: 10, right: 10 },
                tableWidth: 190,

                head: [[
                    "No", "Txn ID", "Date", "Payment Type",
                    "Req. Amount", "Pay Amount", "Status"
                ]],

                body: tableData,

                columnStyles: {
                    0: { cellWidth: 10, halign: "center" },   // No
                    1: { cellWidth: 25, halign: "center" },   // Txn ID
                    2: { cellWidth: 25, halign: "center" },   // Date
                    3: { cellWidth: 30, halign: "center" },   // Payment Type
                    4: { cellWidth: 35, halign: "right" },    // Req. Amount
                    5: { cellWidth: 35, halign: "right" },    // Pay Amount
                    6: { cellWidth: 30, halign: "center" },   // Status
                },

                headStyles: {
                    fillColor: [230, 111, 81],
                    textColor: 255,
                    fontSize: 7.5,
                    fontStyle: "bold",
                    halign: "center",
                    valign: "middle",
                    cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
                },

                styles: {
                    fontSize: 7.5,
                    cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
                    valign: "middle",
                    overflow: "ellipsize",
                },

                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },

                bodyStyles: {
                    textColor: [60, 60, 60],
                },
            });

            doc.save("financial-ledger-report.pdf");
            toast.success("Report downloaded!");

        } catch (error) {
            toast.error("Failed to generate report");
        }
    };

    const handlePayoutSubmit = async (e) => {
        e.preventDefault();

        const balance = report?.payoutBalance || 0;

        if (balance <= 0) {
            return toast.error("No payout balance available");
        }

        const bankFilled =
            payoutData.bankName ||
            payoutData.accountName ||
            payoutData.accountNumber ||
            payoutData.ifscCode;

        const upiFilled = payoutData.upiId;

        /* ⭐ ONLY ONE METHOD ALLOWED */
        if (bankFilled && upiFilled) {
            return toast.error("Please choose only ONE payout method (Bank OR UPI)");
        }

        if (!bankFilled && !upiFilled) {
            return toast.error("Please provide Bank Details or UPI ID");
        }

        /* ⭐ BANK FULL VALIDATION */
        if (bankFilled) {
            if (!payoutData.bankName.trim())
                return toast.error("Bank name is required");

            if (!payoutData.accountName.trim())
                return toast.error("Account holder name is required");

            if (!/^[0-9]{9,18}$/.test(payoutData.accountNumber))
                return toast.error("Invalid account number");

            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(payoutData.ifscCode))
                return toast.error("Invalid IFSC code");
        }

        /* ⭐ UPI VALIDATION */
        if (upiFilled) {
            if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(payoutData.upiId))
                return toast.error("Invalid UPI ID");
        }

        const payoutPayload = {
            amount: balance,
            bankDetails: bankFilled ? {
                bankName: payoutData.bankName,
                accountName: payoutData.accountName,
                accountNumber: payoutData.accountNumber,
                ifscCode: payoutData.ifscCode.toUpperCase()
            } : null,
            upiId: upiFilled ? payoutData.upiId : null
        };

        try {
            setLoading(true);

            const response = await post("/api/doctor-portal/payout/submit", payoutPayload);

            if (response.status) {
                toast.success("Payout request submitted successfully!");
                setIsPayoutModalOpen(false);

                setPayoutData({
                    bankName: "",
                    accountName: "",
                    accountNumber: "",
                    ifscCode: "",
                    upiId: ""
                });

                loadData(); // refresh report balance
            } else {
                toast.error(response.message || "Failed to process payout");
            }

        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to process payout";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MasterLayout>

            <div className="space-y-8">

                {/* Header */}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div>
                        <h2 className="text-2xl font-bold text-neutral-800">
                            Earnings & Reports
                        </h2>

                        <p className="text-sm text-neutral-500">
                            Track your financial performance and patient reviews
                        </p>
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all"
                    >
                        <Icon icon="solar:history-bold" />
                        Payout History
                    </button>

                </div>


                {/* Stats */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {stats.map((stat, idx) => (

                        <div key={idx} className="card-container p-6 relative overflow-hidden group">

                            <div className="flex items-center justify-between mb-4">

                                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                    <Icon icon={stat.icon} className="text-2xl" />
                                </div>

                                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-green-100 text-green-600">
                                    {stat.trend}
                                </span>

                            </div>

                            <p className="text-neutral-500 text-sm">{stat.title}</p>

                            <h3 className="text-2xl font-extrabold text-neutral-800">
                                {stat.value}
                            </h3>

                        </div>

                    ))}

                </div>


                {/* Chart */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 card-container p-8">

                        <div className="flex items-center justify-between mb-6">

                            <h3 className="font-bold text-lg text-neutral-800">
                                Revenue Growth
                            </h3>

                            <div className="flex flex-wrap items-center gap-4">
                                <select
                                    className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm font-bold text-neutral-600 outline-none focus:ring-1 focus:ring-brand"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="SELECT_DAY">Select Day</option>
                                    <option value="SELECT_MONTH">Select Month</option>
                                    <option value="SELECT_YEAR">Select Year</option>
                                    <option value="CUSTOM_RANGE">Custom Range</option>
                                </select>

                                {filter === "SELECT_DAY" && (
                                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                        <input
                                            type="date"
                                            className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm font-bold text-neutral-600 outline-none focus:ring-1 focus:ring-brand"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                )}

                                {filter === "SELECT_MONTH" && (
                                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                        <input
                                            type="month"
                                            className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm font-bold text-neutral-600 outline-none focus:ring-1 focus:ring-brand"
                                            value={startDate ? startDate.substring(0, 7) : ""}
                                            onChange={(e) => setStartDate(e.target.value + "-01")}
                                        />
                                    </div>
                                )}

                                {filter === "SELECT_YEAR" && (
                                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                        <select
                                            className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm font-bold text-neutral-600 outline-none focus:ring-1 focus:ring-brand"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        >
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {filter === "CUSTOM_RANGE" && (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                        <input
                                            type="date"
                                            className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm font-bold text-neutral-600 outline-none focus:ring-1 focus:ring-brand"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <span className="text-[10px] font-black text-neutral-300 tracking-widest px-2 uppercase italic">TO</span>
                                        <input
                                            type="date"
                                            className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 text-sm font-bold text-neutral-600 outline-none focus:ring-1 focus:ring-brand"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                        </div>

                        <ReactApexChart
                            options={chartOptions}
                            series={chartSeries}
                            type="area"
                            height={300}
                        />

                    </div>


                    {/* Payout Card */}

                    <div className="space-y-6">

                        <div className="card-container p-6 bg-neutral-900 text-white">

                            <h4 className="font-bold mb-4">Payout Balance</h4>

                            <p className="text-3xl font-black text-brand">
                                ₹{report?.payoutBalance || 0}
                            </p>

                            <button
                                onClick={() => setIsPayoutModalOpen(true)}
                                className="w-full mt-6 py-3 bg-brand rounded-xl font-bold"
                            >
                                Request Instant Payout
                            </button>

                        </div>

                    </div>

                </div>


                {/* Transaction Table */}

                <div className="card-container">

                    <div className="p-6 border-b">
                        <h3 className="font-bold text-lg">
                            Transaction History
                        </h3>
                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead>
                                <tr className="bg-neutral-50 text-xs font-bold uppercase">
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Payment Type</th>
                                    <th className="px-6 py-4">Req. Amount</th>
                                    <th className="px-6 py-4">Pay Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">

                                {currentTransactions.map((txn) => (

                                    <tr key={txn.id}>

                                        <td className="px-6 py-4 font-bold">
                                            {txn.id.slice(0, 8)}
                                        </td>

                                        <td className="px-6 py-4">
                                            {new Date(txn.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-bold text-neutral-500">
                                            {txn.paymentMethod}
                                        </td>

                                        <td className="px-6 py-4 font-bold">
                                            ₹{txn.requestedAmount}
                                        </td>

                                        <td className="px-6 py-4 font-bold">
                                            ₹{txn.paidAmount}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${txn.status === "ACCEPTED"
                                                ? "bg-green-100 text-green-600"
                                                : txn.status === "REJECTED"
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-amber-100 text-amber-600"
                                                }`}>
                                                {txn.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                    {transactions.length > 0 && (
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

            <Modal
                isOpen={isPayoutModalOpen}
                onClose={() => setIsPayoutModalOpen(false)}
                title="Instant Payout Request"
                maxWidth="max-w-xl"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsPayoutModalOpen(false)}
                            className="px-6 py-2 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            form="payout-form"
                            type="submit"
                            className="px-8 py-2 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                        >
                            Submit Request
                        </button>
                    </div>
                }
            >
                <form id="payout-form" onSubmit={handlePayoutSubmit} className="space-y-6">
                    <div className="p-4 bg-brand-light/50 rounded-2xl border border-brand/10 text-center">
                        <p className="text-sm text-brand font-bold leading-relaxed">
                            Your payout request will be submitted to the administration for review.
                            Funds will be transferred to your chosen payment method once the request is approved.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h5 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">BANK ACCOUNT DETAILS</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 ml-1">BANK NAME</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. HDFC Bank"
                                        value={payoutData.bankName}
                                        onChange={(e) => setPayoutData({ ...payoutData, bankName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 ml-1">ACCOUNT HOLDER NAME</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Name as per bank"
                                        value={payoutData.accountName}
                                        onChange={(e) => setPayoutData({ ...payoutData, accountName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 ml-1">ACCOUNT NUMBER</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter account number"
                                        value={payoutData.accountNumber}
                                        onChange={(e) => setPayoutData({ ...payoutData, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 ml-1">IFSC CODE</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter IFSC code"
                                        value={payoutData.ifscCode}
                                        onChange={(e) => setPayoutData({ ...payoutData, ifscCode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="relative py-4">
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-neutral-100"></div>
                            <span className="relative bg-white px-4 text-[10px] font-bold text-neutral-300 left-1/2 -translate-x-1/2 tracking-widest uppercase italic">OR</span>
                        </div>

                        <div>
                            <h5 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">UPI DETAILS</h5>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 ml-1">UPI ID</label>
                                <div className="relative">
                                    <Icon icon="solar:link-bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        className="input-field pl-12"
                                        placeholder="username@upi"
                                        value={payoutData.upiId}
                                        onChange={(e) => setPayoutData({ ...payoutData, upiId: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>

        </MasterLayout>
    );
};

export default Earnings;