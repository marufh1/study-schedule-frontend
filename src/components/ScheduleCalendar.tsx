/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Schedule } from "../types";

interface ScheduleCalendarProps {
  schedules: Schedule[];
}

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  events: Schedule[];
};

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ schedules }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Generate calendar days whenever currentDate or schedules change
  useEffect(() => {
    const days = generateCalendarDays(currentDate, schedules);
    setCalendarDays(days);
  }, [currentDate, schedules]);

  // Generate calendar days for the current month view
  const generateCalendarDays = (date: Date, schedules: Schedule[]): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();

    // Total days in the month
    const daysInMonth = lastDay.getDate();

    // Array to hold all calendar days
    const days: CalendarDay[] = [];

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: filterSchedulesForDate(schedules, date),
      });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: filterSchedulesForDate(schedules, date),
      });
    }

    // Add days from next month to complete the grid (to make it 6 rows)
    const totalDaysNeeded = 42; // 6 rows * 7 days
    const remainingDays = totalDaysNeeded - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: filterSchedulesForDate(schedules, date),
      });
    }

    return days;
  };

  // Filter schedules for a specific date
  const filterSchedulesForDate = (schedules: Schedule[], date: Date): Schedule[] => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return (
        scheduleDate.getFullYear() === date.getFullYear() && scheduleDate.getMonth() === date.getMonth() && scheduleDate.getDate() === date.getDate()
      );
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Format schedule time
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Get schedule type color
  const getScheduleTypeColor = (type: string): string => {
    switch (type) {
      case "WORK":
        return "bg-red-200 text-red-800";
      case "CLASS":
        return "bg-blue-200 text-blue-800";
      case "STUDY":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Get the month and year string
  const getMonthYearString = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="schedule-calendar">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="text-gray-600 hover:text-gray-900">
          &lt; Previous
        </button>

        <h2 className="text-lg font-semibold">{getMonthYearString(currentDate)}</h2>

        <button onClick={goToNextMonth} className="text-gray-600 hover:text-gray-900">
          Next &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-24 border p-1 ${day.isCurrentMonth ? "bg-white" : "bg-gray-100 text-gray-400"} ${
              day.date.toDateString() === new Date().toDateString() ? "border-blue-500 border-2" : "border-gray-200"
            }`}
          >
            <div className="text-right">{day.date.getDate()}</div>

            <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
              {day.events.map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className={`px-1 py-0.5 text-xs rounded ${getScheduleTypeColor(event.type)}`}
                  title={`${event.title} (${formatTime(event.startTime)} - ${formatTime(event.endTime)})`}
                >
                  <div className="truncate">
                    {formatTime(event.startTime)} - {event.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
