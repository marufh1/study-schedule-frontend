import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnergyLevelService from "../services/energy-level.service";
import { EnergyLevelFormData } from "../types";

interface EnergyLevelFormProps {
  userId: string;
}

const EnergyLevelForm: React.FC<EnergyLevelFormProps> = ({ userId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [energyLevels, setEnergyLevels] = useState<Record<string, Record<string, number>>>({
    MONDAY: { MORNING: 5, AFTERNOON: 5, EVENING: 5, NIGHT: 5 },
    TUESDAY: { MORNING: 5, AFTERNOON: 5, EVENING: 5, NIGHT: 5 },
    WEDNESDAY: { MORNING: 5, AFTERNOON: 5, EVENING: 5, NIGHT: 5 },
    THURSDAY: { MORNING: 5, AFTERNOON: 5, EVENING: 5, NIGHT: 5 },
    FRIDAY: { MORNING: 5, AFTERNOON: 5, EVENING: 5, NIGHT: 5 },
    SATURDAY: { MORNING: 5, AFTERNOON: 5, EVENING: 5, NIGHT: 5 },
    SUNDAY: { MORNING: 5, AFTERNOON: 5, EVENING: 5, NIGHT: 5 },
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const timeSlots = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

  useEffect(() => {
    const fetchEnergyLevels = async () => {
      try {
        setLoading(true);
        const data = await EnergyLevelService.getByUserId(userId);

        const newEnergyLevels = { ...energyLevels };
        data.forEach((level) => {
          if (newEnergyLevels[level.day] && level.timeSlot) {
            newEnergyLevels[level.day][level.timeSlot] = level.level;
          }
        });

        setEnergyLevels(newEnergyLevels);
        setError(null);
      } catch (err) {
        console.error("Error fetching energy levels:", err);
        setError("Failed to load energy level data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyLevels();
  }, [userId]);

  const handleLevelChange = (day: string, timeSlot: string, value: number) => {
    setEnergyLevels((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeSlot]: value,
      },
    }));
  };

  // Copy a day to all other days
  const copyDayToAll = (sourceDay: string) => {
    const newLevels = { ...energyLevels };

    days.forEach((day) => {
      if (day !== sourceDay) {
        newLevels[day] = { ...newLevels[sourceDay] };
      }
    });

    setEnergyLevels(newLevels);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      const energyLevelArray: EnergyLevelFormData[] = [];
      Object.entries(energyLevels).forEach(([day, slots]) => {
        Object.entries(slots).forEach(([timeSlot, level]) => {
          energyLevelArray.push({
            day,
            timeSlot: timeSlot as "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT",
            level,
          });
        });
      });

      const existingLevels = await EnergyLevelService.getByUserId(userId);
      await Promise.all(existingLevels.map((level) => EnergyLevelService.delete(level._id)));
      await Promise.all(energyLevelArray.map((level) => EnergyLevelService.create(userId, level)));

      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving energy levels:", err);
      setError("Failed to save energy levels. Please try again.");
      setSaving(false);
    }
  };

  const formatDayName = (day: string): string => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  const formatTimeSlot = (slot: string): string => {
    return slot.charAt(0) + slot.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Set Your Energy Levels</h2>

      <p className="text-gray-600 mb-5">
        Rate your typical energy levels throughout the day on a scale from 1 (lowest) to 10 (highest). This helps the optimizer schedule complex tasks
        during your high-energy periods.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left"></th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="py-3 px-4 text-center">
                    {formatTimeSlot(slot)}
                  </th>
                ))}
                <th className="py-3 px-4 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium text-gray-700">{formatDayName(day)}</td>

                  {timeSlots.map((slot) => (
                    <td key={`${day}-${slot}`} className="py-3 px-4">
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={energyLevels[day][slot]}
                          onChange={(e) => handleLevelChange(day, slot, parseInt(e.target.value))}
                          className="w-full mr-2"
                        />
                        <span className="text-sm w-6 text-center">{energyLevels[day][slot]}</span>
                      </div>
                    </td>
                  ))}

                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => copyDayToAll(day)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Copy this day's energy levels to all other days"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded focus:outline-none disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Energy Levels"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnergyLevelForm;
