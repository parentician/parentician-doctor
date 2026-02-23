import { useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const Availability = () => {
    const [activeTab, setActiveTab] = useState("SCHEDULE");
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const [selectedDay, setSelectedDay] = useState("MONDAY");

    const [schedule, setSchedule] = useState({
        MONDAY: [{ start: "10:00 AM", end: "10:15 AM" }, { start: "10:15 AM", end: "10:30 AM" }],
        TUESDAY: [{ start: "02:00 PM", end: "02:15 PM" }],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
        SATURDAY: [],
        SUNDAY: [],
    });

    const [blockedDates, setBlockedDates] = useState([
        { id: 1, date: "2026-03-15", reason: "Personal work" },
        { id: 2, date: "2026-03-20", reason: "Training session" },
    ]);

    const addSlot = (day) => {
        // Dummy logic to add a 15-min slot after the last one
        const daySlots = [...schedule[day]];
        let nextStart = "09:00 AM";
        let nextEnd = "09:15 AM";

        if (daySlots.length > 0) {
            const lastSlot = daySlots[daySlots.length - 1];
            // simplified time increment for demo
            nextStart = lastSlot.end;
            const [time, period] = nextStart.split(" ");
            let [h, m] = time.split(":").map(Number);
            m += 15;
            if (m >= 60) { h += 1; m = 0; }
            nextEnd = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
        }

        setSchedule({
            ...schedule,
            [day]: [...daySlots, { start: nextStart, end: nextEnd }]
        });
        toast.success(`Slot added for ${day}`);
    };

    const removeSlot = (day, index) => {
        const daySlots = schedule[day].filter((_, i) => i !== index);
        setSchedule({ ...schedule, [day]: daySlots });
    };

    return (
        <MasterLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-neutral-800">My Availability</h2>
                    <div className="flex bg-neutral-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab("SCHEDULE")}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SCHEDULE' ? 'bg-white text-brand shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Weekly Schedule
                        </button>
                        <button
                            onClick={() => setActiveTab("BLOCKED")}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'BLOCKED' ? 'bg-white text-brand shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Blocked Dates
                        </button>
                    </div>
                </div>

                {activeTab === "SCHEDULE" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Days List */}
                        <div className="card-container p-4 space-y-1 h-fit">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${selectedDay === day ? 'bg-brand text-white' : 'hover:bg-brand-light hover:text-brand'}`}
                                >
                                    <span className="text-sm font-bold uppercase">{day}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs ${selectedDay === day ? 'text-white/80' : 'text-neutral-400'}`}>
                                            {schedule[day].length} Slots
                                        </span>
                                        <Icon icon="solar:alt-arrow-right-bold" className={`text-sm ${selectedDay === day ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Slots Builder */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="card-container p-8">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-800">{selectedDay}</h3>
                                        <p className="text-sm text-neutral-500">Configure your consultation time slots for this day</p>
                                    </div>
                                    <button
                                        onClick={() => addSlot(selectedDay)}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-light text-brand rounded-xl font-bold hover:bg-brand hover:text-white transition-all"
                                    >
                                        <Icon icon="solar:add-circle-bold" className="text-xl" />
                                        <span>Add Slot</span>
                                    </button>
                                </div>

                                {schedule[selectedDay].length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {schedule[selectedDay].map((slot, index) => (
                                            <div key={index} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-between group hover:border-brand transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Icon icon="solar:clock-circle-bold" className="text-brand text-xl" />
                                                    <div>
                                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter leading-none mb-1">Duration: 15m</p>
                                                        <p className="text-sm font-bold text-neutral-800 leading-none">{slot.start} - {slot.end}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeSlot(selectedDay, index)}
                                                    className="p-2 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-bold" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-neutral-300">
                                            <Icon icon="solar:calendar-block-bold" className="text-2xl text-neutral-300" />
                                        </div>
                                        <h4 className="font-bold text-neutral-800">No active slots</h4>
                                        <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">Click 'Add Slot' to start building your availability for {selectedDay}.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-brand text-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-brand/10">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Icon icon="solar:checklist-bold" className="text-4xl" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-lg font-bold">Automatic Synchronization</h4>
                                    <p className="text-sm opacity-90 mt-1">Changes made here will be instantly reflected on your public booking page and synchronized with your Google Calendar.</p>
                                </div>
                                <button className="px-8 py-3 bg-white text-brand font-bold rounded-xl hover:bg-neutral-50 transition-colors whitespace-nowrap">
                                    Manual Sync
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-3xl">
                        <div className="card-container p-8">
                            <h4 className="text-lg font-bold text-neutral-800 mb-6">Block Specific Dates</h4>
                            <p className="text-sm text-neutral-500 mb-8">Blocking a date prevents patients from booking any sessions on that particular day.</p>

                            <form className="flex flex-col sm:flex-row gap-4 mb-8" onSubmit={(e) => {
                                e.preventDefault();
                                const date = e.target.date.value;
                                const reason = e.target.reason.value;
                                if (date) {
                                    setBlockedDates([...blockedDates, { id: Date.now(), date, reason }]);
                                    toast.success("Date blocked successfully");
                                    e.target.reset();
                                }
                            }}>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-neutral-500 mb-1">SELECT DATE</label>
                                    <input type="date" name="date" className="input-field" required />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-neutral-500 mb-1">REASON (OPTIONAL)</label>
                                    <input type="text" name="reason" className="input-field" placeholder="e.g. Vacation" />
                                </div>
                                <button type="submit" className="sm:self-end h-[42px] px-8 bg-brand text-white font-bold rounded-lg hover:bg-brand-dark transition-colors">
                                    Block Date
                                </button>
                            </form>

                            <div className="space-y-4">
                                <h5 className="font-bold text-neutral-800 text-sm uppercase tracking-wider">Currently Blocked Dates</h5>
                                {blockedDates.length > 0 ? (
                                    <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden">
                                        {blockedDates.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                                                        <Icon icon="solar:calendar-mark-bold" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-neutral-800">{item.date}</p>
                                                        <p className="text-xs text-neutral-500">{item.reason || "No reason provided"}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setBlockedDates(blockedDates.filter(b => b.id !== item.id))}
                                                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Icon icon="solar:close-circle-bold" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-400 italic">No dates are currently blocked.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MasterLayout>
    );
};

export default Availability;
