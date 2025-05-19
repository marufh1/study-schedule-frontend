/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
      console.log({ existingLevels });
      await Promise.all(existingLevels.map((level) => EnergyLevelService.delete(level._id)));
      await Promise.all(energyLevelArray.map((level) => EnergyLevelService.create(userId, level)));

      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving energy levels:", err);
      setError("Failed to save energy levels. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Set Your Energy Levels</h2>

      <p className="text-gray-600 mb-6">
        Rate your typical energy levels throughout the day on a scale from 1 (lowest) to 10 (highest). This helps the optimizer schedule complex tasks
        during your high-energy periods.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-2">
            <div className="md:col-span-1"></div>
            {timeSlots.map((slot) => (
              <div key={slot} className="text-center font-medium">
                {slot.charAt(0) + slot.slice(1).toLowerCase()}
              </div>
            ))}
          </div>

          {days.map((day) => (
            <div key={day} className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-4">
              <div className="font-medium flex items-center">{day.charAt(0) + day.slice(1).toLowerCase()}</div>

              {timeSlots.map((slot) => (
                <div key={`${day}-${slot}`} className="flex flex-col items-center">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevels[day][slot]}
                    onChange={(e) => handleLevelChange(day, slot, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm mt-1">{energyLevels[day][slot]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Energy Levels"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnergyLevelForm;
