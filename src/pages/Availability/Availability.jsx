import { useState } from "react";
import MasterLayout from "../../components/Layout/MasterLayout";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { get, put, post, del } from "../../helper/api_helper";

const Availability = () => {
    const [activeTab, setActiveTab] = useState("SCHEDULE");
    const [selectedDay, setSelectedDay] = useState("MONDAY");
    const [disabledDays, setDisabledDays] = useState([]);
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

    const [schedule, setSchedule] = useState({
        MONDAY: [],
        TUESDAY: [],
        WEDNESDAY: [],
        THURSDAY: [],
        FRIDAY: [],
        SATURDAY: [],
        SUNDAY: [],
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [blockedDates, setBlockedDates] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSlotAppointments, setSelectedSlotAppointments] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalData, setConfirmModalData] = useState(null);
    const [appointmentsToAttend, setAppointmentsToAttend] = useState([]);
    const [cancellationReason, setCancellationReason] = useState("");
    const [confirmLoading, setConfirmLoading] = useState(false);

    const fetchBlockedDates = async () => {
        try {
            const res = await get("/api/doctor-portal/blocked-dates");
            if (res.status) {
                setBlockedDates(res.data);
            }
        } catch (error) {
            console.error("Error fetching blocked dates:", error);
        }
    };

    const [sessionDuration, setSessionDuration] = useState(15);
    const [newSlotTimes, setNewSlotTimes] = useState({ start: "", end: "" });

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                setLoading(true);
                const res = await get("/api/doctor-portal/availability");
                if (res.status && res.data) {
                    if (res.data.session_duration) {
                        setSessionDuration(Number(res.data.session_duration));
                    }
                    if (res.data.available_time) {
                        const newSchedule = {
                            MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [],
                            FRIDAY: [], SATURDAY: [], SUNDAY: []
                        };
                        const newDisabledDays = [];
                        res.data.available_time.forEach(item => {
                            const day = item.day.toUpperCase();
                            if (newSchedule[day]) {
                                newSchedule[day] = item.slots;
                            }
                            if (item.isActive === false) {
                                newDisabledDays.push(day);
                            }
                        });
                        setSchedule(newSchedule);
                        setDisabledDays(newDisabledDays);
                    }
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailability();
        fetchBlockedDates(); // Call this to load blocked dates on reload
    }, []);

    const updateAvailabilityOnBackend = async (newSchedule, currentDisabledDays = disabledDays) => {
        try {
            const available_time = Object.keys(newSchedule).map(day => ({
                day,
                slots: newSchedule[day],
                isActive: !currentDisabledDays.includes(day)
            }));

            await put("/api/doctor-portal/update-availability", {
                available_time,
                session_duration: String(sessionDuration)
            });
        } catch (error) {
            console.error("Error updating availability:", error);
            toast.error("Failed to sync with server");
        }
    };

    const generateTimeOptions = () => {
        const options = [];
        const interval = Number(sessionDuration) || 15; // Fallback to 15
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += interval) {
                const hour = i % 12 || 12;
                const ampm = i < 12 ? "AM" : "PM";
                const timeStr = `${hour}:${j.toString().padStart(2, '0')} ${ampm}`;
                options.push(timeStr);
            }
        }
        return options;
    };
    const timeOptions = generateTimeOptions();

    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const [time, period] = timeStr.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return h * 60 + m;
    };

    const formatTime = (totalMin) => {
        let h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const ampm = h < 12 ? "AM" : "PM";
        h = h % 12 || 12;
        return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const formatDayDate = (day) => {
        const daysMap = { "SUNDAY": 0, "MONDAY": 1, "TUESDAY": 2, "WEDNESDAY": 3, "THURSDAY": 4, "FRIDAY": 5, "SATURDAY": 6 };
        const now = new Date();
        const currentDayIndex = now.getDay();
        const targetDayIndex = daysMap[day];
        let diff = targetDayIndex - currentDayIndex;
        if (diff < 0) diff += 7;

        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + diff);

        const dayNum = targetDate.getDate();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthStr = months[targetDate.getMonth()];

        return `${dayNum} ${monthStr}`;
    };

    const addSlotRange = (day) => {
        if (!newSlotTimes.start || !newSlotTimes.end) {
            return toast.error("Please select both start and end time");
        }

        const startMin = parseTime(newSlotTimes.start);
        const endMin = parseTime(newSlotTimes.end);

        if (endMin <= startMin) {
            return toast.error("End time must be after start time");
        }

        const duration = Number(sessionDuration);
        const diff = endMin - startMin;

        if (diff < duration) {
            return toast.error("Range must be greater than session duration");
        }

        // 12-hour buffer validation
        const now = new Date();
        const dayIndexMap = { "MONDAY": 1, "TUESDAY": 2, "WEDNESDAY": 3, "THURSDAY": 4, "FRIDAY": 5, "SATURDAY": 6, "SUNDAY": 0 };
        const currentDayIndex = now.getDay();
        const targetDayIndex = dayIndexMap[day];

        const currentMin = now.getHours() * 60 + now.getMinutes();
        const buffer = 12 * 60; // 720 minutes

        if (currentDayIndex === targetDayIndex) {
            // If adding for today, must be 12 hours after current time
            if (startMin < currentMin + buffer) {
                return toast.error("Slots must start at least 12 hours from now");
            }
        } else if ((currentDayIndex + 1) % 7 === targetDayIndex) {
            // If adding for tomorrow, check if the buffer rolls over
            const rolloverMin = (currentMin + buffer) - 1440;
            if (rolloverMin > 0 && startMin < rolloverMin) {
                return toast.error("Slots must start at least 12 hours from now");
            }
        }

        let slots = [];
        let current = startMin;

        while (current < endMin) {
            let next = current + duration;

            if (next > endMin) break;

            slots.push({
                start: formatTime(current),
                end: formatTime(next),
            });

            current = next;
        }

        const existingSlots = schedule[day] || [];
        const uniqueNewSlots = slots.filter(newSlot =>
            !existingSlots.some(existing =>
                existing.start === newSlot.start && existing.end === newSlot.end
            )
        );

        if (uniqueNewSlots.length === 0) {
            return toast.error("All slots in this range are already present");
        }

        const updatedSchedule = {
            ...schedule,
            [day]: [...existingSlots, ...uniqueNewSlots]
        };

        setSchedule(updatedSchedule);
        updateAvailabilityOnBackend(updatedSchedule);

        const skippedCount = slots.length - uniqueNewSlots.length;
        if (skippedCount > 0) {
            toast.success(`${uniqueNewSlots.length} slots added (${skippedCount} duplicates skipped)`);
        } else {
            toast.success(`${uniqueNewSlots.length} slots added`);
        }
        setNewSlotTimes({ start: "", end: "" });
    };

    const removeSlot = (day, index) => {
        if (schedule[day][index].isBooked) {
            return toast.error("Cannot delete a booked slot");
        }
        const daySlots = schedule[day].filter((_, i) => i !== index);
        const updatedSchedule = { ...schedule, [day]: daySlots };
        setSchedule(updatedSchedule);
        updateAvailabilityOnBackend(updatedSchedule);
    };


    const checkAppointments = async (params) => {
        try {
            const res = await post("/api/doctor-portal/check-appointments", params);
            return res.status ? res.appointments : [];
        } catch (error) {
            console.error("Error checking appointments:", error);
            return [];
        }
    };

    const toggleDayStatus = async (day) => {
        if (disabledDays.includes(day)) {
            // Turning ON - no check needed
            const newDisabledDays = disabledDays.filter(d => d !== day);
            setDisabledDays(newDisabledDays);
            await updateAvailabilityOnBackend(schedule, newDisabledDays);
            toast.success(`${day} is now ON`);
        } else {
            // Turning OFF - check for appointments
            const appointments = await checkAppointments({ dayOfWeek: day });
            if (appointments.length > 0) {
                setConfirmModalData({
                    type: "TOGGLE",
                    day,
                    appointments,
                    title: `Deactivating ${day}`,
                    description: `There are ${appointments.length} booked appointments on this day. 
Turning off this day will apply to all future weeks for this weekday. 
Please select the appointments you will attend — others will be automatically cancelled.`
                });
                setAppointmentsToAttend(appointments.map(a => a.id));
                setCancellationReason("");
                setShowConfirmModal(true);
            } else {
                const newDisabledDays = [...disabledDays, day];
                setDisabledDays(newDisabledDays);
                await updateAvailabilityOnBackend(schedule, newDisabledDays);
                toast.success(`${day} is now OFF`);
            }
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmModalData) return;

        const appointmentsToCancel = confirmModalData.appointments
            .filter(app => !appointmentsToAttend.includes(app.id))
            .map(app => app.id);

        if (appointmentsToCancel.length > 0 && !cancellationReason.trim()) {
            return toast.error("Cancellation reason is required");
        }

        setConfirmLoading(true);
        try {
            let res;
            if (confirmModalData.type === "TOGGLE") {
                res = await post("/api/doctor-portal/management/toggle-day", {
                    day: confirmModalData.day,
                    isActive: false,
                    appointmentsToCancel,
                    cancellationReason
                });
            } else if (confirmModalData.type === "BLOCK") {
                res = await post("/api/doctor-portal/management/block-date", {
                    ...confirmModalData.payload,
                    appointmentsToCancel,
                    cancellationReason
                });
            }

            if (res.status) {
                toast.success(res.message || "Updated successfully");
                setShowConfirmModal(false);
                setConfirmModalData(null);
                // Refresh data
                const fetchAvailability = async () => {
                    const res = await get("/api/doctor-portal/availability");
                    if (res.status && res.data) {
                        if (res.data.available_time) {
                            const newSchedule = {
                                MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [],
                                FRIDAY: [], SATURDAY: [], SUNDAY: []
                            };
                            const newDisabledDays = [];
                            res.data.available_time.forEach(item => {
                                const day = item.day.toUpperCase();
                                if (newSchedule[day]) newSchedule[day] = item.slots;
                                if (item.isActive === false) newDisabledDays.push(day);
                            });
                            setSchedule(newSchedule);
                            setDisabledDays(newDisabledDays);
                        }
                    }
                };
                fetchAvailability();
                fetchBlockedDates();
            } else {
                toast.error(res.message || "Failed to update");
            }
        } catch (error) {
            console.error("Error confirming action:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while confirming action";
            toast.error(errorMessage);
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <MasterLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-neutral-800">My Availability</h2>
                    <div className="flex items-center gap-3 bg-neutral-100 p-1 rounded-xl">
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
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold uppercase">{day}</span>
                                        <span className={`text-[10px] font-medium ${selectedDay === day ? 'text-white/70' : 'text-neutral-400'}`}>
                                            {formatDayDate(day)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            {disabledDays.includes(day) && (
                                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-red-100 text-red-600 rounded tracking-widest">OFF</span>
                                            )}
                                            {blockedDates.some(b => {
                                                const daysMap = { "SUNDAY": 0, "MONDAY": 1, "TUESDAY": 2, "WEDNESDAY": 3, "THURSDAY": 4, "FRIDAY": 5, "SATURDAY": 6 };
                                                const now = new Date();
                                                now.setHours(0, 0, 0, 0);
                                                const start = new Date(b.startDate);
                                                start.setHours(0, 0, 0, 0);
                                                const end = new Date(b.endDate || b.startDate);
                                                end.setHours(0, 0, 0, 0);
                                                // Check if any occurrence in the next 7 days for this day of week is blocked
                                                for (let i = 0; i < 7; i++) {
                                                    const d = new Date(now);
                                                    d.setDate(now.getDate() + i);
                                                    if (d.getDay() === daysMap[day]) {
                                                        if (d >= start && d <= end) return true;
                                                    }
                                                }
                                                return false;
                                            }) && (
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded tracking-widest">BLOCKED</span>
                                                )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs ${selectedDay === day ? 'text-white/80' : 'text-neutral-400'}`}>
                                                {disabledDays.includes(day) ? "Disabled" : `${schedule[day].length} Slots`}
                                            </span>
                                            <Icon icon="solar:alt-arrow-right-bold" className={`text-sm ${selectedDay === day ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Slots Builder */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="card-container p-8">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-neutral-800 uppercase tracking-tight">{selectedDay}</h3>
                                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                {formatDayDate(selectedDay)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-500">Configure your consultation time slots for this day</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {blockedDates.some(b => {
                                            const daysMap = { "SUNDAY": 0, "MONDAY": 1, "TUESDAY": 2, "WEDNESDAY": 3, "THURSDAY": 4, "FRIDAY": 5, "SATURDAY": 6 };
                                            const now = new Date();
                                            now.setHours(0, 0, 0, 0);
                                            const start = new Date(b.startDate);
                                            start.setHours(0, 0, 0, 0);
                                            const end = new Date(b.endDate || b.startDate);
                                            end.setHours(0, 0, 0, 0);
                                            for (let i = 0; i < 7; i++) {
                                                const d = new Date(now);
                                                d.setDate(now.getDate() + i);
                                                if (d.getDay() === daysMap[selectedDay]) {
                                                    if (d >= start && d <= end) return true;
                                                }
                                            }
                                            return false;
                                        }) && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-bold">
                                                    <Icon icon="solar:info-circle-bold" className="text-sm" />
                                                    <span>Overridden by Blocked Date</span>
                                                </div>
                                            )}
                                        <button
                                            onClick={() => toggleDayStatus(selectedDay)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${disabledDays.includes(selectedDay)
                                                ? "bg-brand text-white shadow-lg shadow-brand/20"
                                                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                                                }`}
                                        >
                                            <Icon icon="solar:power-bold" className="text-xl" />
                                            <span>{disabledDays.includes(selectedDay) ? "Turn On" : "Turn Off"}</span>
                                        </button>
                                    </div>
                                </div>

                                {disabledDays.includes(selectedDay) ? (
                                    <div className="py-20 text-center bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Icon icon="solar:power-bold" className="text-2xl text-neutral-400" />
                                        </div>
                                        <h4 className="font-bold text-neutral-800">Day is Turned Off</h4>
                                        <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">Turn on the day to manage your availability slots.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Slots Grid or Empty State */}
                                        {loading ? (
                                            <div className="col-span-full py-20 text-center">
                                                <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-brand mx-auto mb-4" />
                                                <p className="text-neutral-500 font-medium">Loading your slots...</p>
                                            </div>
                                        ) : schedule[selectedDay].length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {schedule[selectedDay].map((slot, index) => {
                                                    const startMin = parseTime(slot.start);
                                                    const endMin = parseTime(slot.end);
                                                    const dur = endMin - startMin;
                                                    return (
                                                        <div key={index} className="p-4 bg-white border border-neutral-100 rounded-2xl flex items-center justify-between group hover:border-brand/30 hover:shadow-md transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-brand">
                                                                    <Icon icon="solar:clock-circle-bold" className="text-xl" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Duration: {dur}M</p>
                                                                    <p className="text-sm font-black text-neutral-800 tracking-tight">{slot.start} - {slot.end}</p>
                                                                </div>
                                                            </div>
                                                            {slot.isBooked ? (
                                                                <div
                                                                    onClick={() => {
                                                                        setSelectedSlotAppointments(slot.appointments || []);
                                                                        setShowDetailsModal(true);
                                                                    }}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors"
                                                                >
                                                                    <Icon icon="solar:lock-bold" className="text-xs" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-tight">Booked</span>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => removeSlot(selectedDay, index)}
                                                                    className="p-2 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <Icon icon="solar:trash-bin-trash-bold" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-16 text-center bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                    <Icon icon="solar:calendar-block-bold" className="text-2xl text-neutral-300" />
                                                </div>
                                                <h4 className="font-bold text-neutral-800 tracking-tight">No active slots</h4>
                                                <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">Use the range selector below to build your availability for {selectedDay}.</p>
                                            </div>
                                        )}

                                        {/* Add Range Section */}
                                        <div className="mt-8 pt-8 border-t border-neutral-100">
                                            <div className="flex flex-wrap items-end gap-4 bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100">
                                                <div className="flex-1 min-w-[140px]">
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Start Time</label>
                                                    <div className="relative">
                                                        <select
                                                            value={newSlotTimes.start}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setNewSlotTimes(prev => {
                                                                    const newState = { ...prev, start: val };
                                                                    if (prev.end && parseTime(val) >= parseTime(prev.end)) {
                                                                        newState.end = "";
                                                                    }
                                                                    return newState;
                                                                });
                                                            }}
                                                            className="w-full h-[50px] px-4 rounded-xl border border-neutral-200 bg-white font-bold text-neutral-700 outline-none focus:border-brand transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="">Select Start</option>
                                                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                        <Icon icon="solar:alt-arrow-down-bold" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-[140px]">
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">End Time</label>
                                                    <div className="relative">
                                                        <select
                                                            value={newSlotTimes.end}
                                                            onChange={(e) => setNewSlotTimes(prev => ({ ...prev, end: e.target.value }))}
                                                            className="w-full h-[50px] px-4 rounded-xl border border-neutral-200 bg-white font-bold text-neutral-700 outline-none focus:border-brand transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="">Select End</option>
                                                            {timeOptions.filter(t => parseTime(t) > parseTime(newSlotTimes.start)).map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                        <Icon icon="solar:alt-arrow-down-bold" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => addSlotRange(selectedDay)}
                                                    className="h-[50px] px-6 bg-brand text-white rounded-xl flex items-center justify-center hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95 group"
                                                >
                                                    <Icon icon="solar:add-circle-bold" className="text-2xl mr-2 group-hover:rotate-90 transition-transform" />
                                                    <span className="font-bold">Add Range</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-3xl">
                        <div className="card-container p-8">
                            <h4 className="text-lg font-bold text-neutral-800 mb-6">Block Specific Dates</h4>
                            <p className="text-sm text-neutral-500 mb-8">Blocking a date prevents patients from booking any sessions on that particular day.</p>

                            <form
                                className="flex flex-col lg:flex-row items-end gap-4 mb-8 bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const startDate = e.target.startDate.value;
                                    const endDate = e.target.endDate.value;
                                    const reason = e.target.reason.value;
                                    if (startDate) {
                                        if (endDate && new Date(endDate) < new Date(startDate)) {
                                            return toast.error("End date cannot be before start date");
                                        }

                                        const appointments = await checkAppointments({ startDate, endDate });
                                        if (appointments.length > 0) {
                                            setConfirmModalData({
                                                type: "BLOCK",
                                                payload: { startDate, endDate, reason },
                                                appointments,
                                                title: "Blocking Dates",
                                                description: `There are ${appointments.length} booked appointments in this date range. Please select which ones you will still attend. Unselected ones will be cancelled.`
                                            });
                                            setAppointmentsToAttend(appointments.map(a => a.id));
                                            setCancellationReason("");
                                            setShowConfirmModal(true);
                                        } else {
                                            try {
                                                const res = await post("/api/doctor-portal/block-date", { startDate, endDate, reason });
                                                if (res.status) {
                                                    setBlockedDates([...blockedDates, res.data]);
                                                    toast.success("Date range blocked successfully");
                                                    e.target.reset();
                                                }
                                            } catch (error) {
                                                const errorMessage = error.response?.data?.message || error?.message || "Error blocking date";
                                                toast.error(errorMessage);
                                            }
                                        }
                                    }
                                }}
                            >
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">START DATE</label>
                                    <input type="date" name="startDate" className="input-field h-[46px]" required min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">END DATE</label>
                                    <input type="date" name="endDate" className="input-field h-[46px]" min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="flex-[2] w-full">
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">REASON (OPTIONAL)</label>
                                    <input type="text" name="reason" className="input-field h-[46px]" placeholder="e.g. Annual Vacation, Conference" maxLength={100} />
                                </div>
                                <button type="submit" className="h-[46px] px-8 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95 whitespace-nowrap">
                                    Block Range
                                </button>
                            </form>

                            <div className="space-y-4">
                                <h5 className="font-bold text-neutral-800 text-sm uppercase tracking-wider">Currently Blocked Dates</h5>
                                {blockedDates.length > 0 ? (
                                    <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden">
                                        {blockedDates.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors gap-4">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="p-2 bg-red-50 text-red-500 rounded-lg shrink-0">
                                                        <Icon icon="solar:calendar-mark-bold" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-neutral-800 truncate">
                                                            {item.startDate === item.endDate ? item.startDate : `${item.startDate} to ${item.endDate}`}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 break-words line-clamp-2 hover:line-clamp-none transition-all">{item.reason || "No reason provided"}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await del(`/api/doctor-portal/unblock-date/${item.id}`);
                                                            if (res.status) {
                                                                setBlockedDates(blockedDates.filter(b => b.id !== item.id));
                                                                toast.success("Blocked date removed");
                                                            }
                                                        } catch (error) {
                                                            const errorMessage = error.response?.data?.message || "Error removing blocked date";
                                                            toast.error(errorMessage);
                                                        }
                                                    }}
                                                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                                                >
                                                    <Icon icon="solar:close-circle-bold" className="text-xl" />
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
            {/* Appointment Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-800">Booking Details</h3>
                                <p className="text-sm text-neutral-500 mt-1">Upcoming sessions for this time slot</p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                            >
                                <Icon icon="solar:close-circle-bold" className="text-2xl" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">
                            {selectedSlotAppointments.length > 0 ? (
                                selectedSlotAppointments.map((appt, idx) => (
                                    <div key={appt.id || idx} className="p-6 rounded-3xl bg-white border border-neutral-100 hover:border-brand/20 transition-all space-y-6 shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand">
                                                    <Icon icon="solar:user-bold" className="text-2xl" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-neutral-800">{appt.fullName}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                                                            {appt.status}
                                                        </span>
                                                        <span className="text-neutral-300 text-xs">•</span>
                                                        <span className="text-neutral-500 text-xs font-medium">{appt.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Fee Paid</p>
                                                <p className="text-xl font-black text-brand tracking-tight">₹{appt.grandTotal}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-0 gap-4">
                                            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Concern</p>
                                                <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                                                    {appt.concern || "Not provided"}
                                                </p>
                                            </div>
                                        </div>

                                        {appt.meeting_link && (
                                            <div className="flex items-center justify-between p-4 bg-brand/5 border border-brand/10 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <Icon icon="solar:videocamera-bold" className="text-brand text-xl" />
                                                    <span className="text-sm font-bold text-brand">Session Meeting Link</span>
                                                </div>
                                                <a
                                                    href={appt.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-dark transition-all"
                                                >
                                                    Join Now
                                                </a>
                                            </div>
                                        )}

                                        {appt.additionalDetails && (
                                            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Additional Notes</p>
                                                <p className="text-xs text-amber-800 leading-relaxed italic">{appt.additionalDetails}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                                    <Icon icon="solar:document-text-bold" className="text-4xl text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-500 font-medium whitespace-pre-line">
                                        Details are unavailable for this slot.\nIt might have been booked but data is missing.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-neutral-50/50 border-t border-neutral-100 text-center">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="w-full py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-neutral-100">
                        {/* Header */}
                        <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                                    <Icon icon="solar:danger-bold" className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-neutral-800 tracking-tight">{confirmModalData?.title}</h3>
                                    <p className="text-sm text-neutral-500 font-medium">Please review the impact on scheduled appointments</p>
                                </div>
                            </div>
                            <button
                                onClick={() => !confirmLoading && setShowConfirmModal(false)}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 transition-all hover:bg-red-50"
                            >
                                <Icon icon="solar:close-circle-bold" className="text-2xl" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 custom-scrollbar">
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                                    {confirmModalData?.description}
                                </p>
                            </div>

                            {/* Appointments List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Select appointments to keep</h4>
                                    <button
                                        onClick={() => {
                                            if (appointmentsToAttend.length === confirmModalData?.appointments.length) {
                                                setAppointmentsToAttend([]);
                                            } else {
                                                setAppointmentsToAttend(confirmModalData?.appointments.map(a => a.id));
                                            }
                                        }}
                                        className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
                                    >
                                        {appointmentsToAttend.length === confirmModalData?.appointments.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {confirmModalData?.appointments.map((appt) => (
                                        <div
                                            key={appt.id}
                                            onClick={() => {
                                                if (appointmentsToAttend.includes(appt.id)) {
                                                    setAppointmentsToAttend(prev => prev.filter(id => id !== appt.id));
                                                } else {
                                                    setAppointmentsToAttend(prev => [...prev, appt.id]);
                                                }
                                            }}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${appointmentsToAttend.includes(appt.id)
                                                ? 'bg-brand/5 border-brand shadow-sm'
                                                : 'bg-white border-neutral-100 hover:border-neutral-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${appointmentsToAttend.includes(appt.id) ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-400'
                                                    }`}>
                                                    <Icon icon={appointmentsToAttend.includes(appt.id) ? "solar:check-circle-bold" : "solar:user-bold"} className="text-xl" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-800">{appt.patientName}</p>
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{appt.date} • {appt.slot}</p>
                                                </div>
                                            </div>
                                            {appointmentsToAttend.includes(appt.id) ? (
                                                <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-2 py-1 rounded-lg">Will Attend</span>
                                            ) : (
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-1 rounded-lg border border-red-100">Will Cancel</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cancellation Reason */}
                            {confirmModalData?.appointments.length > appointmentsToAttend.length && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest px-2">Reason for Cancellation</label>
                                    <textarea
                                        value={cancellationReason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        placeholder="e.g. Unforeseen personal emergency, clinical requirement..."
                                        className="w-full h-32 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 outline-none focus:border-brand transition-all font-medium text-neutral-700 resize-none shadow-inner"
                                    />
                                    <p className="text-[10px] text-neutral-400 px-2">This reason will be shared with the patients via email.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-neutral-50/50 border-t border-neutral-100 flex items-center gap-4">
                            <button
                                onClick={() => !confirmLoading && setShowConfirmModal(false)}
                                disabled={confirmLoading}
                                className="flex-1 py-4 px-6 rounded-2xl border border-neutral-200 bg-white text-neutral-600 font-bold hover:bg-neutral-100 transition-all disabled:opacity-50 active:scale-[0.98]"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                disabled={confirmLoading || (confirmModalData?.appointments.length > appointmentsToAttend.length && !cancellationReason.trim())}
                                className="flex-[2] py-4 px-6 rounded-2xl bg-brand text-white font-black shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                {confirmLoading ? (
                                    <Icon icon="line-md:loading-twotone-loop" className="text-xl" />
                                ) : (
                                    <Icon icon="solar:check-read-bold" className="text-xl group-hover:scale-110 transition-transform" />
                                )}
                                <span>{confirmLoading ? 'Processing...' : 'Confirm & Proceed'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

export default Availability;
